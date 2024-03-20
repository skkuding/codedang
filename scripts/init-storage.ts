import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'
import { readdir, readFile } from 'fs/promises'
import { resolve, basename } from 'path'

const main = async () => {
  await Promise.all([setupTestcaseBucket(), setupMediaBucket()]).then(() => {
    console.log('All buckets are set up')
  })
}

const setupMediaBucket = async () => {
  const client = new S3Client({
    region: 'ap-northeast-2',
    // endpoint: process.env.TESTCASE_ENDPOINT_URL,
    endpoint: process.env.STORAGE_BUCKET_ENDPOINT_URL,
    forcePathStyle: true, // required for minio
    credentials: {
      accessKeyId: process.env.MEDIA_ACCESS_KEY || '',
      secretAccessKey: process.env.MEDIA_SECRET_KEY || ''
    }
  })

  const bucketName = process.env.MEDIA_BUCKET_NAME
  if (!bucketName) throw new Error('MEDIA_BUCKET_NAME is not defined')

  // Check if target bucket exists
  const bucketList = await client.send(new ListBucketsCommand({}))

  const bucketExists = bucketList.Buckets?.find(
    (bucket) => bucket.Name === bucketName
  )

  // Create bucket if not exists
  if (!bucketExists) {
    await client.send(new CreateBucketCommand({ Bucket: bucketName }))

    await client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'AddPerm',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`]
            }
          ]
        })
      })
    )
    console.log('Created bucket', bucketName)
  }
}

const setupTestcaseBucket = async () => {
  const client = new S3Client({
    region: 'ap-northeast-2',
    // endpoint: process.env.TESTCASE_ENDPOINT_URL,
    endpoint: process.env.STORAGE_BUCKET_ENDPOINT_URL,
    forcePathStyle: true, // required for minio
    credentials: {
      accessKeyId: process.env.TESTCASE_ACCESS_KEY || '',
      secretAccessKey: process.env.TESTCASE_SECRET_KEY || ''
    }
  })

  const bucketName = process.env.TESTCASE_BUCKET_NAME
  if (!bucketName) throw new Error('TESTCASE_BUCKET_NAME is not defined')

  // Check if target bucket exists
  const bucketList = await client.send(new ListBucketsCommand({}))

  const bucketExists = bucketList.Buckets?.find(
    (bucket) => bucket.Name === bucketName
  )

  // Create bucket if not exists
  if (!bucketExists) {
    await client.send(new CreateBucketCommand({ Bucket: bucketName }))

    await client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'AddPerm',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`]
            }
          ]
        })
      })
    )
    console.log('Created bucket', bucketName)
  }

  // upload example testcase files
  const dir = resolve(basename(__dirname), '../apps/iris/tests/data/testcase')
  const files = await readdir(dir)
  for (const file of files) {
    const data = await readFile(resolve(dir, file), {
      encoding: 'utf-8'
    })
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: file,
        Body: data,
        ContentType: 'application/json'
      })
    )
    console.log('Uploaded', file)
  }
}

main()
