import { Client } from 'minio'

const main = async () => {
  const client = new Client({
    endPoint: 'codedang-testcase',
    port: 9000,
    useSSL: false,
    accessKey: 'skku',
    secretKey: 'skku1234'
  })

  const bucketName = 'test-bucket'

  if (await client.bucketExists(bucketName)) {
    console.log('Bucket already exists.')
    return
  }

  await client.makeBucket(bucketName, 'ap-northeast-2')
  console.log('Bucket created successfully.')

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

  await client.putObject(
    bucketName,
    '1.json',
    JSON.stringify(data),
    JSON.stringify(data).length,
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json'
    }
  )
  console.log('File uploaded successfully.')
}

main()
