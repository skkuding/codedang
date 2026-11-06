import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { acquireExecutionLock } from './execution-lock.mjs'
import { git, listUsers } from './notion-backup.mjs'

const documentSecretDir = '/run/secrets/notion-backup'
const activitySecretDir = '/run/secrets/notion-activity-backup'
const eventLogPath = '/home/node/.n8n/notion-events/events.jsonl'

async function config(directory, name, fileName, fallback = '') {
  if (process.env[name]) return process.env[name].trim()
  try {
    return (await readFile(join(directory, fileName), 'utf8')).trim()
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

function eventDate(timestamp) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'Asia/Seoul',
      year: 'numeric'
    })
      .formatToParts(new Date(timestamp))
      .map(({ type, value }) => [type, value])
  )
  return `${parts.year}-${parts.month}-${parts.day}`
}

function buildActivityLogs(raw, userNames, manifest) {
  const events = new Map()
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue
    const event = JSON.parse(line)
    events.set(event.event_id, {
      ...event,
      author_names: (event.authors || []).map(
        (author) => userNames.get(author.id) || null
      ),
      entity_title: manifest.pages?.[event.entity_id]?.title || null
    })
  }

  const files = new Map()
  for (const event of [...events.values()].sort(
    (left, right) =>
      left.timestamp.localeCompare(right.timestamp) ||
      left.event_id.localeCompare(right.event_id)
  )) {
    const date = eventDate(event.timestamp)
    const path = join('log', date.slice(0, 7), `${date}.jsonl`)
    const lines = files.get(path) || []
    lines.push(JSON.stringify(event))
    files.set(path, lines)
  }

  return new Map(
    [...files].map(([path, lines]) => [path, `${lines.join('\n')}\n`])
  )
}

async function runBackup() {
  let raw
  try {
    raw = await readFile(eventLogPath, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Notion activity backup complete: no events recorded')
      return
    }
    throw error
  }

  const notionToken = await config(
    documentSecretDir,
    'NOTION_TOKEN',
    'notion-token'
  )
  const documentRepository = await config(
    documentSecretDir,
    'GIT_REPOSITORY',
    'git-repository'
  )
  const documentBranch = await config(
    documentSecretDir,
    'GIT_BRANCH',
    'git-branch',
    'main'
  )
  const documentGitToken = await config(
    documentSecretDir,
    'GIT_TOKEN',
    'git-token'
  )
  const documentGitUsername = await config(
    documentSecretDir,
    'GIT_USERNAME',
    'git-username',
    'x-access-token'
  )
  const activityRepository = await config(
    activitySecretDir,
    'ACTIVITY_GIT_REPOSITORY',
    'git-repository'
  )
  const activityBranch = await config(
    activitySecretDir,
    'ACTIVITY_GIT_BRANCH',
    'git-branch',
    'main'
  )
  const activityGitToken = await config(
    activitySecretDir,
    'ACTIVITY_GIT_TOKEN',
    'git-token'
  )
  const activityGitUsername = await config(
    activitySecretDir,
    'ACTIVITY_GIT_USERNAME',
    'git-username',
    'x-access-token'
  )
  const authorName = await config(
    activitySecretDir,
    'ACTIVITY_GIT_AUTHOR_NAME',
    'git-author-name',
    'Codedang Notion Activity Backup'
  )
  const authorEmail = await config(
    activitySecretDir,
    'ACTIVITY_GIT_AUTHOR_EMAIL',
    'git-author-email',
    'notion-activity-backup@codedang.com'
  )
  if (!notionToken || !documentRepository || !activityRepository) {
    throw new Error(
      'Notion token and document/activity Git repositories are required'
    )
  }

  for (const repository of [documentRepository, activityRepository]) {
    const parsed = new URL(repository)
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
      throw new Error(
        'Git repositories must use HTTPS without embedded credentials'
      )
    }
  }

  const workingDirectory = await mkdtemp(
    join(tmpdir(), 'notion-activity-backup-')
  )
  const documentPath = join(workingDirectory, 'documents')
  const activityPath = join(workingDirectory, 'activity')
  const documentAskPass = join(workingDirectory, 'document-git-askpass.sh')
  const activityAskPass = join(workingDirectory, 'activity-git-askpass.sh')
  const documentAuth = {
    askPass: documentAskPass,
    token: documentGitToken,
    username: documentGitUsername
  }
  const activityAuth = {
    askPass: activityAskPass,
    token: activityGitToken,
    username: activityGitUsername
  }

  try {
    const askPassScript =
      '#!/bin/sh\ncase "$1" in *Username*) printf %s "$NOTION_BACKUP_GIT_USERNAME";; *) printf %s "$NOTION_BACKUP_GIT_TOKEN";; esac\n'
    await writeFile(documentAskPass, askPassScript, { mode: 0o700 })
    await writeFile(activityAskPass, askPassScript, { mode: 0o700 })
    await git(
      [
        'clone',
        '--depth=1',
        '--single-branch',
        '--branch',
        documentBranch,
        documentRepository,
        documentPath
      ],
      workingDirectory,
      documentAuth
    )
    await git(
      [
        'clone',
        '--depth=1',
        '--single-branch',
        '--branch',
        activityBranch,
        activityRepository,
        activityPath
      ],
      workingDirectory,
      activityAuth
    )

    const manifest = JSON.parse(
      await readFile(join(documentPath, '.notion-backup-manifest.json'), 'utf8')
    )
    const users = await listUsers(notionToken)
    const userNames = new Map(users.map((user) => [user.id, user.name || null]))
    const activityLogs = buildActivityLogs(raw, userNames, manifest)
    if (activityLogs.size === 0) {
      console.log('Notion activity backup complete: no events recorded')
      return
    }
    for (const [path, content] of activityLogs) {
      await mkdir(dirname(join(activityPath, path)), { recursive: true })
      await writeFile(join(activityPath, path), content)
    }

    await git(['config', 'user.name', authorName], activityPath, activityAuth)
    await git(['config', 'user.email', authorEmail], activityPath, activityAuth)
    await git(['add', '--all', '--', 'log'], activityPath, activityAuth)
    const { stdout: statusOutput } = await git(
      ['status', '--porcelain'],
      activityPath,
      activityAuth
    )
    if (!statusOutput.trim()) {
      console.log('Notion activity backup complete: no changes')
      return
    }

    const now = new Date().toISOString()
    await git(
      ['commit', '-m', `activity: update Notion event log ${now}`],
      activityPath,
      activityAuth
    )
    await git(
      ['push', 'origin', `HEAD:refs/heads/${activityBranch}`],
      activityPath,
      activityAuth
    )
    console.log('Notion activity backup complete: event log pushed')
  } finally {
    await rm(workingDirectory, { recursive: true, force: true })
  }
}

async function main() {
  const releaseLock = await acquireExecutionLock(
    '/tmp/notion-activity-backup.lock'
  )
  if (!releaseLock) {
    console.log('Notion activity backup skipped: another execution is active')
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

export { buildActivityLogs, eventDate }
