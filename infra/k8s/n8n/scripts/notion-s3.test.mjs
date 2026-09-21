import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { test } from 'node:test'
import {
  assertS3SdkCompatibility,
  canonicalJson,
  multipartPartSize,
  objectExists,
  objectKey,
  pageAssetMappings,
  restoreSnapshot,
  snapshotKey,
  validateLogicalPath,
  uploadFile
} from './notion-s3.mjs'

const bytes = Buffer.from('recovered')
const digest = createHash('sha256').update(bytes).digest('hex')
const key = objectKey(digest)

test('creates deterministic object and normalized snapshot keys', () => {
  assert.equal(objectKey(digest, '/production/notion/'), key)
  assert.equal(
    snapshotKey('2026-08-26T12:00:00.000Z', '/production/notion/'),
    'production/notion/snapshots/2026/08/26/2026-08-26T12:00:00.000Z.json'
  )
  assert.throws(() => objectKey(digest, 'other'), /unsupported S3 prefix/)
  assert.throws(
    () => snapshotKey('2026-08-26T12:00:00.000Z', 'production/notion/other'),
    /unsupported S3 prefix/
  )
  assert.equal(
    canonicalJson({ z: 1, a: { d: 2, c: 3 } }),
    '{"a":{"c":3,"d":2},"z":1}\n'
  )
})

test('carries only a page asset mapping', () => {
  const files = {
    'assets/page-a/a': 1,
    'assets/page-b/b': 2,
    'pages/page-a.md': 3
  }
  assert.deepEqual(pageAssetMappings(files, 'page-a'), { 'assets/page-a/a': 1 })
})

test('requires matching S3 metadata for an existing object', async () => {
  const client = {
    send: async (command) => {
      assert.equal(command.constructor.name, 'HeadObjectCommand')
      return {
        ContentLength: bytes.length,
        Metadata: { sha256: digest, size: String(bytes.length) }
      }
    }
  }
  assert.equal(
    await objectExists(client, 'test', key, {
      sha256: digest,
      size: bytes.length
    }),
    true
  )
  await assert.rejects(
    objectExists(client, 'test', key, {
      sha256: '0'.repeat(64),
      size: bytes.length
    }),
    /verification failed/
  )
})

test('loads a compatible bundled or development S3 SDK', () => {
  const loaded = assertS3SdkCompatibility()
  assert.match(loaded.version, /^3\.\d+\.\d+$/)
})

test('uploads multipart parts in order with bounded part sizes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'notion-multipart-test-'))
  const file = join(root, 'large.bin')
  await writeFile(file, Buffer.alloc(multipartPartSize * 2 + 7, 65))
  const commands = []
  const client = {
    send: async (command) => {
      commands.push(command)
      switch (command.constructor.name) {
        case 'CreateMultipartUploadCommand':
          return { UploadId: 'upload-1' }
        case 'UploadPartCommand':
          assert.ok(command.input.Body.length <= multipartPartSize)
          return { ETag: `etag-${command.input.PartNumber}` }
        default:
          return {}
      }
    }
  }
  await uploadFile({
    client,
    bucket: 'test',
    key,
    filePath: file,
    contentType: 'application/octet-stream',
    sha256: digest,
    size: multipartPartSize * 2 + 7,
    kmsKeyId: 'kms'
  })
  assert.deepEqual(
    commands.map((command) => command.constructor.name),
    [
      'CreateMultipartUploadCommand',
      'UploadPartCommand',
      'UploadPartCommand',
      'UploadPartCommand',
      'CompleteMultipartUploadCommand'
    ]
  )
  assert.deepEqual(
    commands.slice(1, 4).map((command) => command.input.PartNumber),
    [1, 2, 3]
  )
  assert.equal(commands[0].input.SSEKMSKeyId, 'kms')
  assert.deepEqual(commands[4].input.MultipartUpload.Parts, [
    { ETag: 'etag-1', PartNumber: 1 },
    { ETag: 'etag-2', PartNumber: 2 },
    { ETag: 'etag-3', PartNumber: 3 }
  ])
  await rm(root, { recursive: true, force: true })
})

test('aborts multipart uploads when a part fails', async () => {
  const root = await mkdtemp(join(tmpdir(), 'notion-multipart-abort-test-'))
  const file = join(root, 'large.bin')
  await writeFile(file, Buffer.alloc(multipartPartSize + 1, 66))
  const commands = []
  const client = {
    send: async (command) => {
      commands.push(command)
      if (command.constructor.name === 'CreateMultipartUploadCommand')
        return { UploadId: 'upload-2' }
      if (command.constructor.name === 'UploadPartCommand')
        throw new Error('part failed')
      return {}
    }
  }
  await assert.rejects(
    uploadFile({
      client,
      bucket: 'test',
      key,
      filePath: file,
      contentType: 'application/octet-stream',
      sha256: digest,
      size: multipartPartSize + 1,
      kmsKeyId: 'kms'
    }),
    /part failed/
  )
  assert.deepEqual(
    commands.map((command) => command.constructor.name),
    [
      'CreateMultipartUploadCommand',
      'UploadPartCommand',
      'AbortMultipartUploadCommand'
    ]
  )
  await rm(root, { recursive: true, force: true })
})

function restoreClient(snapshot, objectBytes = bytes) {
  const responses = [
    { transformToByteArray: async () => Buffer.from(JSON.stringify(snapshot)) },
    { Body: Readable.from([objectBytes]) }
  ]
  return { send: async () => responses.shift() }
}

test('streams restored bytes, verifies them, and rejects traversal', async () => {
  const root = await mkdtemp(join(tmpdir(), 'notion-restore-test-'))
  const snapshot = {
    schema_version: 1,
    prefix: 'production/notion',
    files: { 'pages/a.md': { key, sha256: digest, size: bytes.length } }
  }
  await restoreSnapshot({
    client: restoreClient(snapshot),
    bucket: 'test',
    snapshotObjectKey: 'snapshot',
    outputDirectory: root
  })
  assert.equal(await readFile(join(root, 'pages/a.md'), 'utf8'), 'recovered')
  assert.ok(
    await readFile(join(root, '.notion-backup-s3-manifest.json'), 'utf8')
  )
  assert.throws(
    () => validateLogicalPath(root, '../outside'),
    /unsafe restore path/
  )
  await rm(root, { recursive: true, force: true })
})

test('rejects restored hash and size mismatches without leaving partial files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'notion-restore-mismatch-'))
  const snapshot = {
    schema_version: 1,
    files: {
      'assets/page-a/file': { key, sha256: digest, size: bytes.length + 1 }
    }
  }
  await assert.rejects(
    restoreSnapshot({
      client: restoreClient(snapshot),
      bucket: 'test',
      snapshotObjectKey: 'snapshot',
      outputDirectory: root
    }),
    /verification failed/
  )
  assert.deepEqual(
    await (
      await import('node:fs/promises')
    ).readdir(join(root, 'assets/page-a')),
    []
  )
  await rm(root, { recursive: true, force: true })
})

test('restores deduplicated object references to each logical path', async () => {
  const root = await mkdtemp(join(tmpdir(), 'notion-restore-duplicate-test-'))
  const descriptor = { key, sha256: digest, size: bytes.length }
  const snapshot = {
    schema_version: 1,
    files: { 'assets/a/file': descriptor, 'assets/b/file': descriptor }
  }
  const responses = [
    { transformToByteArray: async () => Buffer.from(JSON.stringify(snapshot)) },
    { Body: Readable.from([bytes]) },
    { Body: Readable.from([bytes]) }
  ]
  await restoreSnapshot({
    client: { send: async () => responses.shift() },
    bucket: 'test',
    snapshotObjectKey: 'snapshot',
    outputDirectory: root
  })
  assert.equal(await readFile(join(root, 'assets/a/file'), 'utf8'), 'recovered')
  assert.equal(await readFile(join(root, 'assets/b/file'), 'utf8'), 'recovered')
  await rm(root, { recursive: true, force: true })
})
