import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'

const main = async () => {
  const client = new S3Client({
    region: 'ap-northeast-2',
    endpoint: 'http://codedang-testcase:9000',
    forcePathStyle: true, // required for minio
    credentials: {
      accessKeyId: 'skku', // TODO: replace with env
      secretAccessKey: 'skku1234'
    }
  })

  const bucketName = 'testcase-bucket'

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

  const data = [
    {
      id: '1:1',
      input: '1\n',
      output: '1\n'
    },
    {
      id: '1:2',
      input: '22\n',
      output: '22\n'
    },
    {
      id: '1:3',
      input: '333\n',
      output: '333\n'
    },
    {
      id: '1:4',
      input: '4444\n',
      output: '4444\n'
    },
    {
      id: '1:5',
      input: '55555\n',
      output: '55555\n'
    }
  ]

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: '1.json',
      Body: JSON.stringify(data),
      ContentType: 'application/json'
    })
  )
  console.log('Uploaded example testcase')
}

main()
