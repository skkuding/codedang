import { ConfigModule, ConfigService } from '@nestjs/config'
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  S3Client
} from '@aws-sdk/client-s3'

export const S3Provider = {
  provide: 'S3_CLIENT',
  import: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const bucket = config.get('TESTCASE_BUCKET_NAME')
    const client = new S3Client({
      region: 'ap-northeast-2',
      // TODO: production 환경에서는 endpoint, forcePathStyle 삭제
      endpoint: config.get('TESTCASE_ENDPOINT_URL'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.get('TESTCASE_ACCESS_KEY'),
        secretAccessKey: config.get('TESTCASE_SECRET_KEY')
      }
    })
    try {
      await client.send(
        new HeadBucketCommand({
          Bucket: bucket
        })
      )
    } catch {
      await client.send(new CreateBucketCommand({ Bucket: bucket }))
      await client.send(
        new PutBucketPolicyCommand({
          Bucket: bucket,
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'AddPerm',
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucket}/*`]
              }
            ]
          })
        })
      )
    }
    return client
  }
}
