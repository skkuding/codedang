import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand
} from '@aws-sdk/client-s3'

const main = async () => {
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

main()
