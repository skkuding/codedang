import { execFile } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, extname, join, sep } from 'node:path'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { acquireExecutionLock } from './execution-lock.mjs'
import {
  canonicalJson,
  createS3Client,
  digestFile,
  objectExists,
  objectKey,
  normalizePrefix,
  pageAssetMappings,
  relativeLogicalPath,
  snapshotKey,
  snapshotSchemaVersion,
  uploadFile,
  uploadSnapshot
} from './notion-s3.mjs'

const execFileAsync = promisify(execFile)
const secretDir = '/run/secrets/notion-backup'
const notionVersion = '2026-03-11'
const requestSpacingMs = 350
const manifestName = '.notion-backup-manifest.json'
const formatVersion = 3
let nextNotionRequestAt = 0

async function config(name, fileName, fallback = '') {
  if (process.env[name]) return process.env[name].trim()
  try {
    const directory =
      fileName.startsWith('aws-') ||
      ['s3-bucket', 's3-prefix', 's3-kms-key-id'].includes(fileName)
        ? '/run/secrets/notion-s3-backup'
        : secretDir
    return (await readFile(join(directory, fileName), 'utf8')).trim()
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function notionRequest(path, token, options = {}) {
  const { retryOn5xx = false, ...fetchOptions } = options
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await sleep(Math.max(0, nextNotionRequestAt - Date.now()))
    nextNotionRequestAt = Date.now() + requestSpacingMs

    let response
    try {
      response = await fetch(`https://api.notion.com${path}`, {
        ...fetchOptions,
        signal: AbortSignal.timeout(60_000),
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': notionVersion,
          'Content-Type': 'application/json',
          ...fetchOptions.headers
        }
      })
    } catch (error) {
      if (attempt === 7) throw error
      await sleep(
        Math.min(30_000, 500 * 2 ** attempt) + Math.floor(Math.random() * 250)
      )
      continue
    }

    if (response.ok) return response.json()

    const retryable =
      response.status === 429 ||
      response.status === 529 ||
      ((fetchOptions.method !== 'POST' || retryOn5xx) &&
        [500, 502, 503, 504].includes(response.status))
    if (!retryable || attempt === 7) {
      const body = await response.text()
      const error = new Error(
        `Notion ${response.status} for ${path}: ${body.slice(0, 500)}`
      )
      error.status = response.status
      try {
        error.notionCode = JSON.parse(body).code
      } catch {}
      throw error
    }

    const retryAfter = Number(response.headers.get('retry-after'))
    const backoff = Number.isFinite(retryAfter)
      ? retryAfter * 1000
      : Math.min(30_000, 500 * 2 ** attempt) + Math.floor(Math.random() * 250)
    await sleep(backoff)
  }
}

async function searchPages(token) {
  const pages = []
  let startCursor
  do {
    const body = {
      page_size: 100,
      filter: { property: 'object', value: 'page' },
      sort: { direction: 'ascending', timestamp: 'last_edited_time' }
    }
    if (startCursor) body.start_cursor = startCursor
    const response = await notionRequest('/v1/search', token, {
      method: 'POST',
      body: JSON.stringify(body),
      retryOn5xx: true
    })
    if (response.request_status?.type === 'incomplete') {
      throw new Error(
        `Notion search was incomplete: ${response.request_status.incomplete_reason || 'unknown reason'}`
      )
    }
    pages.push(...response.results)
    startCursor = response.has_more ? response.next_cursor : undefined
  } while (startCursor)
  return pages
}

async function searchDataSources(token) {
  const dataSources = []
  let startCursor
  do {
    const body = {
      page_size: 100,
      filter: { property: 'object', value: 'data_source' }
    }
    if (startCursor) body.start_cursor = startCursor
    const response = await notionRequest('/v1/search', token, {
      method: 'POST',
      body: JSON.stringify(body),
      retryOn5xx: true
    })
    dataSources.push(...response.results)
    startCursor = response.has_more ? response.next_cursor : undefined
  } while (startCursor)
  return dataSources
}

async function listUsers(token) {
  const users = []
  let startCursor
  do {
    const query = new URLSearchParams({ page_size: '100' })
    if (startCursor) query.set('start_cursor', startCursor)
    const response = await notionRequest(`/v1/users?${query}`, token)
    users.push(...response.results)
    startCursor = response.has_more ? response.next_cursor : undefined
  } while (startCursor)
  return users
}

async function blockChildren(blockId, token) {
  const blocks = []
  let startCursor
  do {
    const query = new URLSearchParams({ page_size: '100' })
    if (startCursor) query.set('start_cursor', startCursor)
    const response = await notionRequest(
      `/v1/blocks/${blockId}/children?${query}`,
      token
    )
    if (response.request_status?.type === 'incomplete') {
      throw new Error(
        `Notion block listing was incomplete for ${blockId}: ${response.request_status.incomplete_reason || 'unknown reason'}`
      )
    }
    blocks.push(...response.results)
    startCursor = response.has_more ? response.next_cursor : undefined
  } while (startCursor)

  for (const block of blocks) {
    if (!block.has_children) continue
    try {
      block.children = await blockChildren(block.id, token)
    } catch (error) {
      if (!isInaccessibleSyncedBlock(block, error)) throw error
      block.children = []
      block.childrenUnavailable = true
      console.warn(`Notion synced block children unavailable: ${block.id}`)
    }
  }
  return blocks
}

function isInaccessibleSyncedBlock(block, error) {
  return (
    block.type === 'synced_block' &&
    error.status === 404 &&
    error.notionCode === 'object_not_found'
  )
}

function richText(items = []) {
  return items
    .map((item) => {
      let text = item.plain_text || ''
      if (item.href) text = `[${text}](${item.href})`
      if (item.annotations?.code) text = `\`${text.replaceAll('`', '\\`')}\``
      if (item.annotations?.bold) text = `**${text}**`
      if (item.annotations?.italic) text = `*${text}*`
      if (item.annotations?.strikethrough) text = `~~${text}~~`
      if (item.annotations?.underline) text = `<u>${text}</u>`
      return text
    })
    .join('')
}

function pageTitle(page) {
  const titleProperty = Object.values(page.properties || {}).find(
    (property) => property.type === 'title'
  )
  return (richText(titleProperty?.title) || 'Untitled')
    .replace(/\s+/g, ' ')
    .trim()
}

function yamlString(value) {
  return JSON.stringify(String(value))
}

function yamlValue(value) {
  return value === undefined || value === null ? 'null' : yamlString(value)
}

function parentMetadata(page, pageTitles, dataSourceTitles) {
  const type = page.parent?.type || 'unknown'
  const id = type === 'workspace' ? null : page.parent?.[type]
  return {
    id,
    title: id ? pageTitles.get(id) || dataSourceTitles.get(id) || null : null,
    type: type.replace(/_id$/, '')
  }
}

function safeFileName(value) {
  return (
    value
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'file'
  )
}

function fileContentType(name) {
  const extension = extname(name).toLowerCase()
  return (
    {
      '.gif': 'image/gif',
      '.jpeg': 'image/jpeg',
      '.jpg': 'image/jpeg',
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm'
    }[extension] || 'application/octet-stream'
  )
}

export function stableAssetName(blockId, originalName) {
  const stableId = createHash('sha256')
    .update(blockId)
    .digest('hex')
    .slice(0, 20)
  return `${stableId}-${safeFileName(originalName)}`
}

function fileSource(block) {
  const value = block[block.type]
  if (
    !value ||
    !['audio', 'file', 'image', 'pdf', 'video'].includes(block.type)
  )
    return null
  const source =
    value[value.type] ||
    (value.type === 'file' ? value : null) ||
    (value.type === 'external' ? { url: value.link } : null)
  if (!source?.url) return null
  return {
    caption: richText(value.caption),
    name: value.name,
    sourceType: value.type,
    url: source.url
  }
}

async function downloadFile(
  url,
  maxFileBytes,
  blockId,
  temporaryDirectory,
  { fetchImpl = fetch, maxAttempts = 4 } = {}
) {
  let temporaryPath
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        signal: AbortSignal.timeout(120_000)
      })
      if (!response.ok) {
        if (
          (response.status === 429 || response.status >= 500) &&
          attempt < 3
        ) {
          const retryAfter = Number(response.headers.get('retry-after'))
          await sleep(
            Number.isFinite(retryAfter)
              ? retryAfter * 1000
              : 1000 * 2 ** attempt
          )
          continue
        }
        const error = new Error(
          `File download failed with ${response.status} for block ${blockId}`
        )
        error.status = response.status
        throw error
      }

      const declaredLength =
        response.headers.get('content-length') === null
          ? null
          : Number(response.headers.get('content-length'))
      if (
        declaredLength !== null &&
        (!Number.isSafeInteger(declaredLength) || declaredLength < 0)
      ) {
        throw new Error(`File ${blockId} has an invalid content-length`)
      }
      if (declaredLength !== null && declaredLength > maxFileBytes) {
        await response.body?.cancel()
        throw new Error(
          `File ${blockId} is ${declaredLength} bytes, above the configured limit ${maxFileBytes}`
        )
      }

      if (!temporaryDirectory) {
        const chunks = []
        const hash = createHash('sha256')
        let totalBytes = 0
        for await (const chunk of response.body) {
          totalBytes += chunk.byteLength
          if (totalBytes > maxFileBytes)
            throw new Error(
              `File ${blockId} exceeds the configured limit ${maxFileBytes}`
            )
          const bytes = Buffer.from(chunk)
          hash.update(bytes)
          chunks.push(bytes)
        }
        if (declaredLength !== null && totalBytes !== declaredLength)
          throw new Error(
            `File ${blockId} content-length mismatch: declared ${declaredLength}, received ${totalBytes}`
          )
        return Buffer.concat(chunks, totalBytes)
      }

      await mkdir(temporaryDirectory, { recursive: true })
      temporaryPath = join(temporaryDirectory, `${randomUUID()}.download`)
      const hash = createHash('sha256')
      let totalBytes = 0
      const counter = new Transform({
        transform(chunk, encoding, callback) {
          totalBytes += chunk.length
          if (totalBytes > maxFileBytes) {
            callback(
              new Error(
                `File ${blockId} exceeds the configured limit ${maxFileBytes}`
              )
            )
            return
          }
          hash.update(chunk)
          callback(null, chunk)
        }
      })
      await pipeline(
        Readable.fromWeb(response.body),
        counter,
        createWriteStream(temporaryPath, { flags: 'wx' })
      )
      if (declaredLength !== null && totalBytes !== declaredLength)
        throw new Error(
          `File ${blockId} content-length mismatch: declared ${declaredLength}, received ${totalBytes}`
        )
      return {
        path: temporaryPath,
        sha256: hash.digest('hex'),
        size: totalBytes
      }
    } catch (error) {
      if (temporaryPath) await rm(temporaryPath, { force: true })
      temporaryPath = undefined
      const transient =
        error.name === 'TimeoutError' ||
        error.name === 'AbortError' ||
        ['ECONNRESET', 'UND_ERR_SOCKET', 'ERR_STREAM_PREMATURE_CLOSE'].includes(
          error.code
        ) ||
        ['ECONNRESET', 'UND_ERR_SOCKET', 'ERR_STREAM_PREMATURE_CLOSE'].includes(
          error.cause?.code
        )
      if (!transient || attempt === maxAttempts - 1) throw error
      await sleep(1000 * 2 ** attempt)
    }
  }
  throw new Error(`File download retries exhausted for block ${blockId}`)
}

function isStaleUrlError(error) {
  return error?.status === 403 || error?.status === 404
}

async function freshFileSource(block, token) {
  let value
  if (block.refresh) {
    const page = await notionRequest(`/v1/pages/${block.refresh.pageId}`, token)
    if (block.refresh.kind === 'cover') value = page.cover
    else if (block.refresh.kind === 'icon') value = page.icon
    else
      value =
        page.properties?.[block.refresh.property]?.files?.[block.refresh.index]
  } else {
    value = (await notionRequest(`/v1/blocks/${block.id}`, token))[block.type]
  }
  return fileSource({ id: block.id, type: block.type, [block.type]: value })
}

async function saveAsset(
  block,
  pageId,
  repositoryPath,
  maxFileBytes,
  temporaryDirectory,
  assetSink,
  token
) {
  let file = fileSource(block)
  if (!file) return null
  if (file.sourceType === 'external') return { ...file, localPath: null }

  let content
  try {
    content = await downloadFile(
      file.url,
      maxFileBytes,
      block.id,
      temporaryDirectory
    )
  } catch (error) {
    if (!isStaleUrlError(error) || !token) throw error
    const refreshed = await freshFileSource(block, token)
    if (!refreshed || refreshed.sourceType === 'external') throw error
    file = refreshed
    content = await downloadFile(
      file.url,
      maxFileBytes,
      block.id,
      temporaryDirectory
    )
  }

  const urlName = basename(new URL(file.url).pathname)
  const originalName =
    file.name || urlName || `${block.type}${extname(urlName)}`
  const name = stableAssetName(block.id, originalName)
  const relativePath = join('assets', pageId, name).split(sep).join('/')
  if (Buffer.isBuffer(content)) {
    const destination = join(repositoryPath, relativePath)
    await mkdir(join(repositoryPath, 'assets', pageId), { recursive: true })
    await writeFile(destination, content)
    const asset = {
      ...file,
      localPath: `s3-backup://${relativePath}`,
      path: destination,
      sha256: createHash('sha256').update(content).digest('hex'),
      size: content.length,
      logicalPath: relativePath
    }
    assetSink?.push(asset)
    return asset
  }
  const asset = {
    ...file,
    localPath: `s3-backup://${relativePath}`,
    path: content.path,
    sha256: content.sha256,
    size: content.size,
    logicalPath: relativePath
  }
  assetSink?.push(asset)
  return asset
}

async function renderPageFiles(page, context) {
  const output = []
  const candidates = []
  if (page.cover)
    candidates.push({
      label: 'Page cover',
      type: 'image',
      value: page.cover,
      refresh: { kind: 'cover' }
    })
  if (page.icon && ['external', 'file'].includes(page.icon.type)) {
    candidates.push({
      label: 'Page icon',
      type: 'image',
      value: page.icon,
      refresh: { kind: 'icon' }
    })
  }
  for (const [propertyName, property] of Object.entries(
    page.properties || {}
  )) {
    if (property.type !== 'files') continue
    property.files.forEach((file, index) => {
      candidates.push({
        label: propertyName,
        type: 'file',
        value: file,
        refresh: { kind: 'property', property: propertyName, index }
      })
    })
  }

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index]
    const block = {
      id: `${page.id}-${index}-${candidate.label}`,
      type: candidate.type,
      [candidate.type]: candidate.value,
      ...(candidate.refresh
        ? { refresh: { pageId: page.id, ...candidate.refresh } }
        : {})
    }
    const asset = await saveAsset(
      block,
      context.pageId,
      context.repositoryPath,
      context.maxFileBytes,
      context.temporaryDirectory,
      context.assets,
      context.token
    )
    if (!asset) continue
    const target = asset.localPath || asset.url
    const label = asset.name || asset.caption || candidate.label
    output.push(
      candidate.type === 'image'
        ? `![${label}](${target})`
        : `[${label}](${target})`
    )
  }
  return output.join('\n\n')
}

async function renderBlocks(blocks, context, depth = 0) {
  const output = []
  const indentation = '  '.repeat(depth)

  for (const block of blocks) {
    const value = block[block.type] || {}
    const text = richText(value.rich_text)
    let line

    switch (block.type) {
      case 'paragraph':
        line = `${indentation}${text}`
        break
      case 'heading_1':
        line = `# ${text}`
        break
      case 'heading_2':
        line = `## ${text}`
        break
      case 'heading_3':
        line = `### ${text}`
        break
      case 'heading_4':
        line = `#### ${text}`
        break
      case 'bulleted_list_item':
        line = `${indentation}- ${text}`
        break
      case 'numbered_list_item':
        line = `${indentation}1. ${text}`
        break
      case 'to_do':
        line = `${indentation}- [${value.checked ? 'x' : ' '}] ${text}`
        break
      case 'toggle':
        line = `${indentation}<details><summary>${text}</summary>`
        break
      case 'quote':
        line = `${indentation}> ${text.replaceAll('\n', `\n${indentation}> `)}`
        break
      case 'callout':
        line = `${indentation}> ${value.icon?.emoji || ''} ${text}`.trimEnd()
        break
      case 'divider':
        line = '---'
        break
      case 'equation':
        line = `$$\n${value.expression || ''}\n$$`
        break
      case 'code': {
        const fence = text.includes('```') ? '````' : '```'
        line = `${fence}${value.language || ''}\n${text}\n${fence}`
        break
      }
      case 'bookmark':
      case 'embed':
      case 'link_preview':
        line = `[${value.caption ? richText(value.caption) : value.url}](${value.url})`
        break
      case 'child_page':
        line = `${indentation}- [${value.title || 'Child page'}](https://notion.so/${block.id.replaceAll('-', '')})`
        break
      case 'child_database':
        line = `${indentation}- ${value.title || 'Child database'} (Notion database)`
        break
      case 'link_to_page': {
        const linkedId =
          value.page_id || value.database_id || value.data_source_id
        line = linkedId
          ? `${indentation}- [Linked Notion content](https://notion.so/${linkedId.replaceAll('-', '')})`
          : '<!-- Notion link_to_page block without a target -->'
        break
      }
      case 'table': {
        const rows = block.children || []
        for (let index = 0; index < rows.length; index += 1) {
          const cells = (rows[index].table_row?.cells || []).map((cell) =>
            richText(cell).replaceAll('|', '\\|')
          )
          output.push(`| ${cells.join(' | ')} |`)
          if (index === 0)
            output.push(`| ${cells.map(() => '---').join(' | ')} |`)
        }
        continue
      }
      case 'table_row':
        continue
      case 'audio':
      case 'file':
      case 'image':
      case 'pdf':
      case 'video': {
        const asset = await saveAsset(
          block,
          context.pageId,
          context.repositoryPath,
          context.maxFileBytes,
          context.temporaryDirectory,
          context.assets,
          context.token
        )
        if (!asset)
          line = `<!-- Missing ${block.type} source for block ${block.id} -->`
        else {
          const target = asset.localPath || asset.url
          const label = asset.caption || asset.name || block.type
          line =
            block.type === 'image'
              ? `![${label}](${target})`
              : `[${label}](${target})`
        }
        break
      }
      case 'breadcrumb':
      case 'column_list':
      case 'column':
      case 'synced_block':
        line = block.childrenUnavailable
          ? `<!-- Inaccessible Notion synced block: ${block.id} -->`
          : ''
        break
      case 'tab':
      case 'meeting_notes':
      case 'template':
      case 'table_of_contents':
        line = ''
        break
      default:
        line = `<!-- Unsupported Notion block: ${block.type} (${block.id}) -->`
    }

    if (line) output.push(line)
    if (
      block.children &&
      !['child_database', 'child_page', 'table'].includes(block.type)
    ) {
      const childDepth = [
        'bulleted_list_item',
        'numbered_list_item',
        'to_do'
      ].includes(block.type)
        ? depth + 1
        : depth
      output.push(await renderBlocks(block.children, context, childDepth))
    }
    if (block.type === 'toggle') output.push(`${indentation}</details>`)
    output.push('')
  }
  return output.join('\n').replace(/\n{3,}/g, '\n\n')
}

async function git(args, cwd, auth) {
  const env = { ...process.env, GIT_TERMINAL_PROMPT: '0' }
  if (auth.token) {
    env.GIT_ASKPASS = auth.askPass
    env.NOTION_BACKUP_GIT_TOKEN = auth.token
    env.NOTION_BACKUP_GIT_USERNAME = auth.username
  }
  return execFileAsync('git', args, { cwd, env, maxBuffer: 10 * 1024 * 1024 })
}

async function runBackup() {
  const notionToken = await config('NOTION_TOKEN', 'notion-token')
  const repository = await config('GIT_REPOSITORY', 'git-repository')
  const branch = await config('GIT_BRANCH', 'git-branch', 'main')
  const gitToken = await config('GIT_TOKEN', 'git-token')
  const gitUsername = await config(
    'GIT_USERNAME',
    'git-username',
    'x-access-token'
  )
  const gitAuthorName = await config(
    'GIT_AUTHOR_NAME',
    'git-author-name',
    'Codedang Notion Backup'
  )
  const gitAuthorEmail = await config(
    'GIT_AUTHOR_EMAIL',
    'git-author-email',
    'notion-backup@codedang.com'
  )
  const maxFileBytes = Number(
    await config(
      'NOTION_BACKUP_MAX_FILE_BYTES',
      'max-file-bytes',
      String(1024 ** 3)
    )
  )
  const awsRegion = await config('AWS_REGION', 'aws-region')
  const awsAccessKeyId = await config('AWS_ACCESS_KEY_ID', 'aws-access-key-id')
  const awsSecretAccessKey = await config(
    'AWS_SECRET_ACCESS_KEY',
    'aws-secret-access-key'
  )
  const s3Bucket = await config('S3_BUCKET', 's3-bucket')
  const s3Prefix = normalizePrefix(
    await config('S3_PREFIX', 's3-prefix', 'production/notion')
  )
  const kmsKeyId = await config('S3_KMS_KEY_ID', 's3-kms-key-id')
  if (!notionToken || !repository)
    throw new Error('notion-token and git-repository are required')
  if (
    !awsRegion ||
    !s3Bucket ||
    !awsAccessKeyId ||
    !awsSecretAccessKey ||
    !kmsKeyId
  )
    throw new Error(
      'aws-region, aws-access-key-id, aws-secret-access-key, s3-bucket, and s3-kms-key-id are required'
    )
  if (!Number.isFinite(maxFileBytes) || maxFileBytes <= 0)
    throw new Error('max-file-bytes must be positive')

  const parsedRepository = new URL(repository)
  if (parsedRepository.protocol !== 'https:') {
    throw new Error('git-repository must use HTTPS')
  }
  if (parsedRepository.username || parsedRepository.password) {
    throw new Error('git-repository must not contain embedded credentials')
  }

  const workingDirectory = await mkdtemp(join(tmpdir(), 'notion-backup-'))
  const repositoryPath = join(workingDirectory, 'repository')
  const askPass = join(workingDirectory, 'git-askpass.sh')
  const auth = { askPass, token: gitToken, username: gitUsername }

  try {
    await writeFile(
      askPass,
      '#!/bin/sh\ncase "$1" in *Username*) printf %s "$NOTION_BACKUP_GIT_USERNAME";; *) printf %s "$NOTION_BACKUP_GIT_TOKEN";; esac\n',
      { mode: 0o700 }
    )
    try {
      await git(
        [
          'clone',
          '--depth=1',
          '--single-branch',
          '--branch',
          branch,
          repository,
          repositoryPath
        ],
        workingDirectory,
        auth
      )
    } catch (cloneError) {
      const { stdout: branchRefs } = await git(
        ['ls-remote', '--heads', repository, `refs/heads/${branch}`],
        workingDirectory,
        auth
      )
      if (branchRefs.trim()) throw cloneError
      await mkdir(repositoryPath)
      await git(['init', '--initial-branch', branch], repositoryPath, auth)
      await git(['remote', 'add', 'origin', repository], repositoryPath, auth)
    }
    await git(['config', 'user.name', gitAuthorName], repositoryPath, auth)
    await git(['config', 'user.email', gitAuthorEmail], repositoryPath, auth)

    let manifest = { format_version: formatVersion, pages: {} }
    let changed = false
    try {
      manifest = JSON.parse(
        await readFile(join(repositoryPath, manifestName), 'utf8')
      )
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      changed = true
    }

    const s3ManifestName = '.notion-backup-s3-manifest.json'
    let s3Manifest
    try {
      s3Manifest = JSON.parse(
        await readFile(join(repositoryPath, s3ManifestName), 'utf8')
      )
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    const initialS3Export =
      !s3Manifest || s3Manifest.schema_version !== snapshotSchemaVersion
    const { client: s3Client } = createS3Client({
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey
      },
      region: awsRegion,
      kmsKeyId
    })
    const pages = await searchPages(notionToken)
    const dataSources = await searchDataSources(notionToken)
    const users = await listUsers(notionToken)
    console.log(`Notion pages discovered: ${pages.length}`)
    const pageTitles = new Map(pages.map((page) => [page.id, pageTitle(page)]))
    const dataSourceTitles = new Map(
      dataSources.map((dataSource) => [
        dataSource.id,
        richText(dataSource.title) || 'Untitled data source'
      ])
    )
    const userNames = new Map(users.map((user) => [user.id, user.name || null]))
    const currentIds = new Set(pages.map((page) => page.id))
    let exported = 0
    const temporaryDirectory = join(workingDirectory, 'files')
    const nextFiles = { ...(s3Manifest?.files || {}) }
    const pendingFiles = new Map()
    const pageMappings = {}

    await mkdir(join(repositoryPath, 'pages'), { recursive: true })
    for (const [index, page] of pages.entries()) {
      if (index > 0 && index % 25 === 0)
        console.log(`Notion pages processed: ${index}/${pages.length}`)
      const existing = manifest.pages[page.id]
      const pagePath = join('pages', `${page.id}.md`)
      let fileExists = true
      try {
        await stat(join(repositoryPath, pagePath))
      } catch {
        fileExists = false
      }

      if (
        !initialS3Export &&
        manifest.format_version === formatVersion &&
        existing?.last_edited_time === page.last_edited_time &&
        fileExists
      ) {
        if (existing.missing_since) {
          delete existing.missing_since
          changed = true
        }
        continue
      }

      for (const path of Object.keys(nextFiles)) {
        if (path === pagePath || path.startsWith(`assets/${page.id}/`))
          delete nextFiles[path]
      }
      const title = pageTitle(page)
      const parent = parentMetadata(page, pageTitles, dataSourceTitles)
      const createdById = page.created_by?.id || null
      const lastEditedById = page.last_edited_by?.id || null
      const assets = []
      const pageContext = {
        assets,
        maxFileBytes,
        pageId: page.id,
        repositoryPath,
        temporaryDirectory,
        token: notionToken
      }
      const pageFiles = await renderPageFiles(page, pageContext)
      const blocks = await blockChildren(page.id, notionToken)
      const content = await renderBlocks(blocks, pageContext)
      const markdown = [
        '---',
        `notion_id: ${yamlString(page.id)}`,
        `notion_url: ${yamlString(page.url)}`,
        `title: ${yamlString(title)}`,
        `created_time: ${yamlValue(page.created_time)}`,
        `created_by_id: ${yamlValue(createdById)}`,
        `created_by_name: ${yamlValue(userNames.get(createdById))}`,
        `last_edited_time: ${yamlString(page.last_edited_time)}`,
        `last_edited_by_id: ${yamlValue(lastEditedById)}`,
        `last_edited_by_name: ${yamlValue(userNames.get(lastEditedById))}`,
        `parent_type: ${yamlString(parent.type)}`,
        `parent_id: ${yamlValue(parent.id)}`,
        `parent_title: ${yamlValue(parent.title)}`,
        `archived: ${Boolean(page.archived)}`,
        `in_trash: ${Boolean(page.in_trash)}`,
        '---',
        '',
        `# ${title}`,
        '',
        pageFiles,
        pageFiles ? '' : null,
        content.trim(),
        ''
      ]
        .filter((line) => line !== null)
        .join('\n')
      await writeFile(join(repositoryPath, pagePath), markdown)
      const pageDigest = await digestFile(join(repositoryPath, pagePath))
      const pageMapping = {
        key: objectKey(pageDigest.sha256, s3Prefix),
        sha256: pageDigest.sha256,
        size: pageDigest.size,
        content_type: 'text/markdown'
      }
      nextFiles[pagePath] = pageMapping
      pendingFiles.set(pagePath, {
        path: join(repositoryPath, pagePath),
        ...pageMapping
      })
      for (const asset of assets) {
        const mapping = {
          key: objectKey(asset.sha256, s3Prefix),
          sha256: asset.sha256,
          size: asset.size,
          content_type:
            asset.sourceType === 'external'
              ? undefined
              : fileContentType(asset.name || asset.logicalPath)
        }
        nextFiles[asset.logicalPath] = mapping
        pendingFiles.set(asset.logicalPath, { path: asset.path, ...mapping })
      }
      pageMappings[page.id] = {
        page: pagePath,
        assets: pageAssetMappings(nextFiles, page.id)
      }
      manifest.pages[page.id] = {
        path: pagePath,
        title,
        last_edited_time: page.last_edited_time,
        last_edited_by_id: lastEditedById,
        parent_id: parent.id,
        parent_type: parent.type
      }
      exported += 1
      changed = true
    }

    const now = new Date().toISOString()
    for (const [pageId, entry] of Object.entries(manifest.pages)) {
      if (!currentIds.has(pageId) && !entry.missing_since) {
        entry.missing_since = now
        changed = true
      }
    }
    for (const page of pages) {
      const pagePath = `pages/${page.id}.md`
      pageMappings[page.id] = {
        page: pagePath,
        assets: pageAssetMappings(nextFiles, page.id)
      }
    }
    if (changed || initialS3Export) {
      manifest.format_version = formatVersion
      manifest.generated_at = now
      await writeFile(
        join(repositoryPath, manifestName),
        `${JSON.stringify(manifest, null, 2)}\n`
      )
    }

    if (!changed && !initialS3Export) {
      console.log(
        `Notion backup complete: ${pages.length} pages checked, no changes`
      )
      return
    }

    const notionManifestDigest = await digestFile(
      join(repositoryPath, manifestName)
    )
    const notionManifestMapping = {
      key: objectKey(notionManifestDigest.sha256, s3Prefix),
      sha256: notionManifestDigest.sha256,
      size: notionManifestDigest.size,
      content_type: 'application/json'
    }
    nextFiles[manifestName] = notionManifestMapping
    pendingFiles.set(manifestName, {
      path: join(repositoryPath, manifestName),
      ...notionManifestMapping
    })

    for (const [logicalPath, file] of pendingFiles) {
      if (!(await objectExists(s3Client, s3Bucket, file.key, file))) {
        await uploadFile({
          client: s3Client,
          bucket: s3Bucket,
          key: file.key,
          filePath: file.path,
          contentType: file.content_type,
          sha256: file.sha256,
          size: file.size,
          kmsKeyId
        })
      }
    }
    const createdAt = new Date().toISOString()
    const snapshot = {
      schema_version: snapshotSchemaVersion,
      snapshot_id: createdAt,
      created_at: createdAt,
      notion_page_count: pages.length,
      prefix: s3Prefix,
      files: nextFiles
    }
    const snapshotBody = canonicalJson(snapshot)
    const snapshotDigest = createHash('sha256')
      .update(snapshotBody)
      .digest('hex')
    const publishedSnapshotKey = snapshotKey(createdAt)
    await uploadSnapshot({
      client: s3Client,
      bucket: s3Bucket,
      key: publishedSnapshotKey,
      body: snapshotBody,
      kmsKeyId
    })
    const s3Metadata = {
      schema_version: snapshotSchemaVersion,
      snapshot_key: publishedSnapshotKey,
      snapshot_sha256: snapshotDigest,
      notion_page_count: pages.length,
      pages: pageMappings,
      files: nextFiles
    }
    await writeFile(
      join(repositoryPath, s3ManifestName),
      canonicalJson(s3Metadata)
    )

    await rm(join(repositoryPath, 'assets'), { recursive: true, force: true })
    await git(['add', '--all'], repositoryPath, auth)
    const { stdout: stagedPaths } = await git(
      [
        'diff',
        '--cached',
        '--name-only',
        '--',
        'pages',
        'assets',
        manifestName,
        s3ManifestName
      ],
      repositoryPath,
      auth
    )
    if (!stagedPaths.trim()) {
      console.log(
        `Notion backup complete: ${pages.length} pages checked, no changes`
      )
      return
    }

    await git(
      ['commit', '-m', `backup: update Notion documents ${now.slice(0, 10)}`],
      repositoryPath,
      auth
    )
    await git(
      ['push', 'origin', `HEAD:refs/heads/${branch}`],
      repositoryPath,
      auth
    )
    console.log(
      `Notion backup complete: ${pages.length} pages checked, ${exported} exported`
    )
  } finally {
    await rm(workingDirectory, { recursive: true, force: true })
  }
}

async function main() {
  const releaseLock = await acquireExecutionLock(
    '/tmp/notion-document-backup.lock'
  )
  if (!releaseLock) {
    console.log('Notion document backup skipped: another execution is active')
    return
  }

  try {
    await runBackup()
  } finally {
    await releaseLock()
  }
}

if (
  process.argv[1] &&
  basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))
) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}

export {
  downloadFile,
  fileSource,
  freshFileSource,
  git,
  isInaccessibleSyncedBlock,
  isStaleUrlError,
  listUsers,
  pageTitle,
  renderBlocks,
  richText,
  saveAsset
}
