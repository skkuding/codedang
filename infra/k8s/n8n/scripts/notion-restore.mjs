import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createS3Client, restoreSnapshot } from './notion-s3.mjs'

async function config(name, fileName, fallback = '') {
  if (process.env[name]) return process.env[name].trim()
  const directory =
    fileName.startsWith('aws-') ||
    ['s3-bucket', 's3-prefix', 's3-kms-key-id'].includes(fileName)
      ? '/run/secrets/notion-s3-backup'
      : '/run/secrets/notion-backup'
  try {
    return (await readFile(join(directory, fileName), 'utf8')).trim()
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

export async function runRestore(snapshotObjectKey, outputDirectory) {
  if (!snapshotObjectKey || !outputDirectory)
    throw new Error(
      'usage: notion-restore.mjs <snapshot-key> <output-directory>'
    )
  const region = await config('AWS_REGION', 'aws-region')
  const accessKeyId = await config('AWS_ACCESS_KEY_ID', 'aws-access-key-id')
  const secretAccessKey = await config(
    'AWS_SECRET_ACCESS_KEY',
    'aws-secret-access-key'
  )
  const bucket = await config('S3_BUCKET', 's3-bucket')
  const prefix = await config('S3_PREFIX', 's3-prefix', 'production/notion')
  const kmsKeyId = await config('S3_KMS_KEY_ID', 's3-kms-key-id')
  if (!region || !bucket || !accessKeyId || !secretAccessKey || !kmsKeyId)
    throw new Error(
      'aws-region, aws-access-key-id, aws-secret-access-key, s3-bucket, and s3-kms-key-id are required'
    )
  const { client } = createS3Client({
    credentials: { accessKeyId, secretAccessKey },
    region,
    kmsKeyId
  })
  return restoreSnapshot({
    client,
    bucket,
    snapshotObjectKey,
    outputDirectory,
    prefix
  })
}

if (
  process.argv[1] &&
  basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))
) {
  runRestore(process.argv[2], process.argv[3])
    .then((snapshot) =>
      console.log(`Restored ${Object.keys(snapshot.files).length} files`)
    )
    .catch((error) => {
      console.error(error.message)
      process.exitCode = 1
    })
}
