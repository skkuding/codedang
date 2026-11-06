import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { after, before, test } from 'node:test'
import {
  downloadFile,
  isInaccessibleSyncedBlock,
  pageTitle,
  renderBlocks,
  richText,
  saveAsset,
  stableAssetName
} from './notion-backup.mjs'

let server
let baseUrl

before(async () => {
  server = createServer((request, response) => {
    if (request.url === '/large') {
      response.writeHead(200)
      response.end('0123456789')
      return
    }
    if (request.url === '/stale') {
      response.writeHead(403)
      response.end()
      return
    }
    response.writeHead(200, { 'content-length': '4' })
    response.end('test')
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  )
})

test('renders annotated rich text', () => {
  assert.equal(
    richText([
      { plain_text: 'bold', annotations: { bold: true } },
      { plain_text: ' link', href: 'https://example.com', annotations: {} }
    ]),
    '**bold**[ link](https://example.com)'
  )
})

test('normalizes page titles', () => {
  assert.equal(
    pageTitle({
      properties: {
        Name: {
          type: 'title',
          title: [{ plain_text: '  Multi\nline  ', annotations: {} }]
        }
      }
    }),
    'Multi line'
  )
})

test('uses collision-resistant asset names', () => {
  assert.notEqual(
    stableAssetName('page-aaaaaaaaaaaa-one', 'video.mp4'),
    stableAssetName('page-aaaaaaaaaaaa-two', 'video.mp4')
  )
})

test('renders nested lists and reports unsupported blocks', async () => {
  const markdown = await renderBlocks(
    [
      {
        id: '1',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ plain_text: 'parent', annotations: {} }]
        },
        children: [
          {
            id: '2',
            type: 'paragraph',
            paragraph: { rich_text: [{ plain_text: 'child', annotations: {} }] }
          }
        ]
      },
      { id: '3', type: 'unknown_block' }
    ],
    {}
  )
  assert.match(markdown, /- parent\n  child/)
  assert.match(markdown, /Unsupported Notion block: unknown_block/)
})

test('links child pages without duplicating their content', async () => {
  const markdown = await renderBlocks(
    [
      {
        id: '153104cd-477e-809d-8dc4-ff2d96ae3090',
        type: 'child_page',
        child_page: { title: 'Child' },
        children: [
          {
            id: '2',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                { plain_text: 'duplicated child content', annotations: {} }
              ]
            }
          }
        ]
      }
    ],
    {}
  )
  assert.match(markdown, /\[Child\]/)
  assert.doesNotMatch(markdown, /duplicated child content/)
})

test('skips only inaccessible synced block children', async () => {
  assert.equal(
    isInaccessibleSyncedBlock(
      { type: 'synced_block' },
      { status: 404, notionCode: 'object_not_found' }
    ),
    true
  )
  assert.equal(
    isInaccessibleSyncedBlock(
      { type: 'paragraph' },
      { status: 404, notionCode: 'object_not_found' }
    ),
    false
  )
  assert.equal(
    isInaccessibleSyncedBlock(
      { type: 'synced_block' },
      { status: 403, notionCode: 'restricted_resource' }
    ),
    false
  )

  const markdown = await renderBlocks(
    [
      {
        id: 'inaccessible',
        type: 'synced_block',
        synced_block: {},
        childrenUnavailable: true,
        children: []
      }
    ],
    {}
  )
  assert.match(markdown, /Inaccessible Notion synced block: inaccessible/)
})

test('downloads a bounded file', async () => {
  assert.equal(
    (await downloadFile(`${baseUrl}/small`, 4, 'small')).toString(),
    'test'
  )
  const temporaryDirectory = await mkdtemp(
    join(tmpdir(), 'notion-download-test-')
  )
  const downloaded = await downloadFile(
    `${baseUrl}/small`,
    4,
    'streamed',
    temporaryDirectory
  )
  assert.equal(downloaded.size, 4)
  assert.equal(await readFile(downloaded.path, 'utf8'), 'test')
  await rm(temporaryDirectory, { recursive: true, force: true })
  await assert.rejects(
    downloadFile(`${baseUrl}/large`, 5, 'large'),
    /exceeds the configured limit/
  )
  const shortFetch = async () => ({
    ok: true,
    headers: new Headers({ 'content-length': '5' }),
    body: Readable.from(['test'])
  })
  await assert.rejects(
    downloadFile('mock://short', 10, 'short', undefined, {
      fetchImpl: shortFetch
    }),
    /content-length mismatch/
  )
  const interruptedDirectory = await mkdtemp(
    join(tmpdir(), 'notion-interrupted-test-')
  )
  const interruptedFetch = async () =>
    new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('partial'))
          controller.error(new Error('interrupted stream'))
        }
      }),
      { headers: { 'content-length': '100' } }
    )
  await assert.rejects(
    downloadFile(
      'https://example.invalid/interrupt',
      200,
      'interrupt',
      interruptedDirectory,
      { fetchImpl: interruptedFetch, maxAttempts: 1 }
    ),
    /interrupted stream/
  )
  assert.deepEqual(await readdir(interruptedDirectory), [])
  await rm(interruptedDirectory, { recursive: true, force: true })
})

test('refreshes an expired page icon url before retrying the download', async () => {
  const block = {
    id: 'page-1-0-Page icon',
    type: 'image',
    image: {
      type: 'file',
      file: { url: `${baseUrl}/stale`, name: 'icon.png', size: 4 }
    },
    refresh: { pageId: 'page-1', kind: 'icon' }
  }
  const originalFetch = globalThis.fetch
  const notionRequests = []
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith('https://api.notion.com/')) {
      notionRequests.push(String(url))
      return new Response(
        JSON.stringify({
          icon: {
            type: 'file',
            file: {
              url: `${baseUrl}/files/icon.png`,
              name: 'icon.png',
              size: 4
            }
          }
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    }
    return originalFetch(url, init)
  }
  const temporaryDirectory = await mkdtemp(
    join(tmpdir(), 'notion-refresh-test-')
  )
  try {
    const asset = await saveAsset(
      block,
      'page-1',
      undefined,
      1024,
      temporaryDirectory,
      undefined,
      'token'
    )
    assert.equal(asset.size, 4)
    assert.match(
      asset.localPath,
      /^s3-backup:\/\/assets\/page-1\/[^/]+-icon\.png$/
    )
    assert.deepEqual(notionRequests, ['https://api.notion.com/v1/pages/page-1'])
  } finally {
    globalThis.fetch = originalFetch
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
})

test('refreshes an expired block file url by re-reading the block', async () => {
  const block = {
    id: 'block-9',
    type: 'image',
    image: { type: 'file', file: { url: `${baseUrl}/stale` } }
  }
  const originalFetch = globalThis.fetch
  const notionRequests = []
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith('https://api.notion.com/')) {
      notionRequests.push(String(url))
      return new Response(
        JSON.stringify({
          id: 'block-9',
          type: 'image',
          image: {
            type: 'file',
            name: 'image.png',
            caption: [],
            file: { url: `${baseUrl}/fresh`, size: 4 }
          }
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    }
    return originalFetch(url, init)
  }
  const temporaryDirectory = await mkdtemp(
    join(tmpdir(), 'notion-block-refresh-test-')
  )
  try {
    const asset = await saveAsset(
      block,
      'page-1',
      undefined,
      1024,
      temporaryDirectory,
      undefined,
      'token'
    )
    assert.equal(asset.name, 'image.png')
    assert.equal(asset.size, 4)
    assert.deepEqual(notionRequests, [
      'https://api.notion.com/v1/blocks/block-9'
    ])
  } finally {
    globalThis.fetch = originalFetch
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
})

test('keeps failing when a stale url cannot be refreshed', async () => {
  const stale = {
    id: 'page-1-0-Page icon',
    type: 'image',
    image: { type: 'file', file: { url: `${baseUrl}/stale` } }
  }
  await assert.rejects(
    saveAsset(
      stale,
      'page-1',
      undefined,
      1024,
      undefined,
      undefined,
      undefined
    ),
    /File download failed with 403/
  )

  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith('https://api.notion.com/')) {
      return new Response('{}', {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    }
    return originalFetch(url, init)
  }
  try {
    const refreshed = { ...stale, refresh: { pageId: 'page-1', kind: 'icon' } }
    await assert.rejects(
      saveAsset(
        refreshed,
        'page-1',
        undefined,
        1024,
        undefined,
        undefined,
        'token'
      ),
      /File download failed with 403/
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('backs up files property attachments with flat file objects', async () => {
  const block = {
    id: 'page-2-2-Attachments',
    type: 'file',
    file: {
      type: 'file',
      name: 'attachment.pdf',
      url: `${baseUrl}/fresh`,
      size: 4
    },
    refresh: {
      pageId: 'page-2',
      kind: 'property',
      property: 'Attachments',
      index: 0
    }
  }
  const temporaryDirectory = await mkdtemp(
    join(tmpdir(), 'notion-property-file-test-')
  )
  try {
    const asset = await saveAsset(
      block,
      'page-2',
      undefined,
      1024,
      temporaryDirectory,
      undefined,
      'token'
    )
    assert.equal(asset.name, 'attachment.pdf')
    assert.match(
      asset.localPath,
      /^s3-backup:\/\/assets\/page-2\/[^/]+-attachment\.pdf$/
    )
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
})
