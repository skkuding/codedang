import { createHash } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, relative, sep } from 'node:path'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'

const productionPackagePath = '/usr/local/lib/node_modules/n8n/package.json'
const fallbackRequire = createRequire(fileURLToPath(import.meta.url))

function loadSdkFrom(requireFn, source) {
  const sdk = requireFn('@aws-sdk/client-s3')
  const packageJson = requireFn('@aws-sdk/client-s3/package.json')
  return { sdk, source, version: packageJson.version }
}

export function loadS3Sdk({ allowFallback = true } = {}) {
  try {
    return loadSdkFrom(createRequire(productionPackagePath), 'production')
  } catch (error) {
    if (!allowFallback)
      throw new Error(`n8n bundled S3 SDK unavailable: ${error.message}`)
    return loadSdkFrom(fallbackRequire, 'fallback')
  }
}

export function isCompatibleS3SdkVersion(version) {
  const [major, minor] = String(version).split('.').map(Number)
  return major === 3 && Number.isInteger(minor) && minor >= 808
}

export function assertS3SdkCompatibility({
  requireExact = false,
  allowFallback = true
} = {}) {
  const loaded = loadS3Sdk({ allowFallback })
  const requiredCommands = [
    'AbortMultipartUploadCommand',
    'CompleteMultipartUploadCommand',
    'CreateMultipartUploadCommand',
    'GetObjectCommand',
    'HeadObjectCommand',
    'PutObjectCommand',
    'S3Client',
    'UploadPartCommand'
  ]
  if (
    requireExact &&
    (loaded.source !== 'production' || loaded.version !== '3.808.0')
  ) {
    throw new Error(
      `expected production @aws-sdk/client-s3 3.808.0, found ${loaded.version} from ${loaded.source}`
    )
  }
  if (
    !isCompatibleS3SdkVersion(loaded.version) ||
    requiredCommands.some((name) => typeof loaded.sdk[name] !== 'function')
  ) {
    throw new Error(`incompatible @aws-sdk/client-s3 ${loaded.version}`)
  }
  return loaded
}

const {
  sdk: {
    AbortMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
    UploadPartCommand
  },
  version: s3SdkVersion,
  source: s3SdkSource
} = assertS3SdkCompatibility()
export { s3SdkSource, s3SdkVersion }

export const snapshotSchemaVersion = 1
export const snapshotMaxBytes = 16 * 1024 * 1024
export const multipartPartSize = 8 * 1024 * 1024
export const multipartThreshold = multipartPartSize
const objectPattern = /^(.+)\/objects\/sha256\/([a-f0-9]{2})\/([a-f0-9]{64})$/

export function normalizePrefix(prefix = 'production/notion') {
  const normalized = String(prefix)
    .trim()
    .replace(/^\/+|\/+$/g, '')
  if (normalized !== 'production/notion') {
    throw new Error(
      `unsupported S3 prefix: ${prefix}; expected production/notion`
    )
  }
  return normalized
}

export function objectKey(sha256, prefix = 'production/notion') {
  const normalized = normalizePrefix(prefix)
  if (!/^[a-f0-9]{64}$/.test(sha256)) throw new Error('invalid SHA-256 digest')
  return `${normalized}/objects/sha256/${sha256.slice(0, 2)}/${sha256}`
}

export function snapshotKey(date, prefix = 'production/notion') {
  const normalized = normalizePrefix(prefix)
  const value = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(value.getTime())) throw new Error('invalid snapshot date')
  const iso = value.toISOString()
  return `${normalized}/snapshots/${iso.slice(0, 4)}/${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso}.json`
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortValue(value[key])])
  )
}

export function canonicalJson(value) {
  return `${JSON.stringify(sortValue(value))}\n`
}

export function pageAssetMappings(files, pageId) {
  const prefix = `assets/${pageId}/`
  return Object.fromEntries(
    Object.entries(files).filter(([path]) => path.startsWith(prefix))
  )
}

export function validateLogicalPath(outputDirectory, logicalPath) {
  if (
    !logicalPath ||
    logicalPath.includes('\0') ||
    logicalPath.includes('\\') ||
    logicalPath.startsWith('/') ||
    /^[a-zA-Z]:[\\/]/.test(logicalPath)
  ) {
    throw new Error(`unsafe restore path: ${logicalPath}`)
  }
  const parts = logicalPath.split('/')
  if (parts.some((part) => part === '..' || part === '.'))
    throw new Error(`unsafe restore path: ${logicalPath}`)
  const destination = join(outputDirectory, logicalPath)
  const root = `${outputDirectory.endsWith(sep) ? outputDirectory : `${outputDirectory}${sep}`}`
  if (destination !== outputDirectory && !destination.startsWith(root))
    throw new Error(`unsafe restore path: ${logicalPath}`)
  return destination
}

export async function digestFile(filePath) {
  const hash = createHash('sha256')
  let size = 0
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk)
    size += chunk.length
  }
  return { sha256: hash.digest('hex'), size }
}

export function createS3Client({ credentials, region, endpoint, kmsKeyId }) {
  return { client: new S3Client({ credentials, region, endpoint }), kmsKeyId }
}

export async function objectExists(client, bucket, key, expected) {
  try {
    const response = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key })
    )
    if (
      !expected ||
      (response.ContentLength === expected.size &&
        response.Metadata?.sha256 === expected.sha256 &&
        response.Metadata?.size === String(expected.size))
    )
      return true
    throw new Error(`S3 object verification failed for ${key}`)
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404)
      return false
    throw error
  }
}

export async function uploadFile({
  client,
  bucket,
  key,
  filePath,
  contentType,
  sha256,
  size,
  kmsKeyId
}) {
  if (!kmsKeyId) throw new Error('s3-kms-key-id is required for S3 uploads')
  const metadata = { sha256, size: String(size) }
  const encryption = kmsKeyId
    ? { ServerSideEncryption: 'aws:kms', SSEKMSKeyId: kmsKeyId }
    : {}
  if (size < multipartThreshold) {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: createReadStream(filePath),
        ContentLength: size,
        ContentType: contentType,
        Metadata: metadata,
        ...encryption
      })
    )
    return
  }

  let uploadId
  try {
    const created = await client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        Metadata: metadata,
        ...encryption
      })
    )
    uploadId = created.UploadId
    if (!uploadId)
      throw new Error(
        `S3 multipart upload did not return an upload ID for ${key}`
      )

    const parts = []
    let partNumber = 1
    let buffered = []
    let bufferedSize = 0
    const source = createReadStream(filePath, {
      highWaterMark: multipartPartSize
    })
    const sendPart = async (body) => {
      const response = await client.send(
        new UploadPartCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
          Body: body,
          ContentLength: body.length
        })
      )
      if (!response.ETag)
        throw new Error(
          `S3 multipart part ${partNumber} did not return an ETag`
        )
      parts.push({ ETag: response.ETag, PartNumber: partNumber })
      partNumber += 1
    }
    for await (const chunk of source) {
      let offset = 0
      while (offset < chunk.length) {
        const length = Math.min(
          multipartPartSize - bufferedSize,
          chunk.length - offset
        )
        buffered.push(chunk.subarray(offset, offset + length))
        bufferedSize += length
        offset += length
        if (bufferedSize === multipartPartSize) {
          await sendPart(Buffer.concat(buffered, bufferedSize))
          buffered = []
          bufferedSize = 0
        }
      }
    }
    if (bufferedSize > 0) await sendPart(Buffer.concat(buffered, bufferedSize))
    await client.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts }
      })
    )
  } catch (error) {
    if (uploadId) {
      try {
        await client.send(
          new AbortMultipartUploadCommand({
            Bucket: bucket,
            Key: key,
            UploadId: uploadId
          })
        )
      } catch {
        // Preserve the upload failure; the bucket lifecycle rule handles a lost abort.
      }
    }
    throw error
  }
}

export async function uploadSnapshot({ client, bucket, key, body, kmsKeyId }) {
  if (!kmsKeyId) throw new Error('s3-kms-key-id is required for S3 uploads')
  const input = {
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: 'application/json'
  }
  input.ServerSideEncryption = 'aws:kms'
  input.SSEKMSKeyId = kmsKeyId
  await client.send(new PutObjectCommand(input))
}

async function responseBytes(response, maxBytes = snapshotMaxBytes) {
  if (response?.transformToByteArray) {
    const bytes = Buffer.from(await response.transformToByteArray())
    if (bytes.length > maxBytes)
      throw new Error(`S3 response exceeds ${maxBytes} bytes`)
    return bytes
  }
  const chunks = []
  let size = 0
  for await (const chunk of response.Body) {
    size += chunk.length
    if (size > maxBytes)
      throw new Error(`S3 response exceeds ${maxBytes} bytes`)
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks, size)
}

function validateObjectDescriptor(logicalPath, descriptor, prefix) {
  if (
    !descriptor ||
    typeof descriptor !== 'object' ||
    !Number.isSafeInteger(descriptor.size) ||
    descriptor.size < 0 ||
    !/^[a-f0-9]{64}$/.test(descriptor.sha256) ||
    typeof descriptor.key !== 'string'
  ) {
    throw new Error(`invalid S3 descriptor for ${logicalPath}`)
  }
  const match = descriptor.key.match(objectPattern)
  if (
    !match ||
    match[1] !== normalizePrefix(prefix) ||
    match[2] !== descriptor.sha256.slice(0, 2) ||
    match[3] !== descriptor.sha256
  ) {
    throw new Error(`invalid S3 object key for ${logicalPath}`)
  }
}

async function restoreObject({ client, bucket, key, destination, expected }) {
  const temporaryPath = `${destination}.${process.pid}.${Math.random().toString(16).slice(2)}.partial`
  const hash = createHash('sha256')
  let size = 0
  const counter = new Transform({
    transform(chunk, encoding, callback) {
      size += chunk.length
      hash.update(chunk)
      callback(null, chunk)
    }
  })
  try {
    const response = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    )
    await mkdir(dirname(temporaryPath), { recursive: true })
    await pipeline(
      response.Body,
      counter,
      createWriteStream(temporaryPath, { flags: 'wx' })
    )
    const digest = hash.digest('hex')
    if (size !== expected.size || digest !== expected.sha256)
      throw new Error(`restore verification failed for ${key}`)
    await rename(temporaryPath, destination)
  } catch (error) {
    await rm(temporaryPath, { force: true })
    throw error
  }
}

export async function restoreSnapshot({
  client,
  bucket,
  snapshotObjectKey,
  outputDirectory,
  prefix = 'production/notion'
}) {
  const normalizedPrefix = normalizePrefix(prefix)
  const snapshotResponse = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: snapshotObjectKey })
  )
  const snapshotBody = await responseBytes(snapshotResponse)
  const snapshot = JSON.parse(snapshotBody.toString('utf8'))
  if (snapshot.schema_version !== snapshotSchemaVersion)
    throw new Error(`unknown snapshot schema: ${snapshot.schema_version}`)
  if (snapshot.prefix && normalizePrefix(snapshot.prefix) !== normalizedPrefix)
    throw new Error('snapshot prefix mismatch')
  await mkdir(outputDirectory, { recursive: true })
  for (const [logicalPath, descriptor] of Object.entries(
    snapshot.files || {}
  )) {
    validateLogicalPath(outputDirectory, logicalPath)
    validateObjectDescriptor(logicalPath, descriptor, normalizedPrefix)
    const destination = validateLogicalPath(outputDirectory, logicalPath)
    await mkdir(dirname(destination), { recursive: true })
    await restoreObject({
      client,
      bucket,
      key: descriptor.key,
      destination,
      expected: descriptor
    })
  }
  await writeFile(
    join(outputDirectory, '.notion-backup-s3-manifest.json'),
    canonicalJson({
      schema_version: snapshot.schema_version,
      snapshot_key: snapshotObjectKey,
      snapshot_sha256: createHash('sha256').update(snapshotBody).digest('hex'),
      notion_page_count: snapshot.notion_page_count,
      files: snapshot.files
    })
  )
  return snapshot
}

export async function readSnapshotFile(filePath) {
  const snapshot = JSON.parse(await readFile(filePath, 'utf8'))
  if (snapshot.schema_version !== snapshotSchemaVersion)
    throw new Error(`unknown snapshot schema: ${snapshot.schema_version}`)
  return snapshot
}

export function relativeLogicalPath(root, path) {
  return relative(root, path).split(sep).join('/')
}
