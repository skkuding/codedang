import { ConfigModule, ConfigService } from '@nestjs/config'
import { S3Client } from '@aws-sdk/client-s3'

// TODO: refactor this provider to integrate with S3MediaProvider
// Maybe we can add more args to useFactory
export const S3Provider = {
  provide: 'S3_CLIENT',
  import: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    // If production, assume that the service is running on AWS
    // and use the default credentials
    const isProduction = config.get('APP_ENV') === 'production'
    if (isProduction) {
      return new S3Client({
        region: 'ap-northeast-2'
      })
    }

    const accessKey = config.get<string>('TESTCASE_ACCESS_KEY')
    const secretKey = config.get<string>('TESTCASE_SECRET_KEY')
    if (!accessKey || !secretKey) {
      throw new Error(
        'TESTCASE_ACCESS_KEY or TESTCASE_SECRET_KEY is not defined'
      )
    }

    return new S3Client({
      region: 'ap-northeast-2',
      endpoint: config.get('STORAGE_BUCKET_ENDPOINT_URL'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey
      }
    })
  }
}

export const S3MediaProvider = {
  provide: 'S3_CLIENT_MEDIA',
  import: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) =>
    new S3Client({
      region: 'ap-northeast-2',
      // TODO: production 환경에서는 endpoint, forcePathStyle 삭제
      endpoint: config.get('STORAGE_BUCKET_ENDPOINT_URL'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.get('MEDIA_ACCESS_KEY') ?? '',
        secretAccessKey: config.get('MEDIA_SECRET_KEY') ?? ''
      }
    })
}
