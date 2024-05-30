import { ConfigModule, ConfigService } from '@nestjs/config'
import { S3Client } from '@aws-sdk/client-s3'

export const S3Provider = {
  provide: 'S3_CLIENT',
  import: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) =>
    new S3Client({
      region: 'ap-northeast-2',
      // TODO: production 환경에서는 endpoint, forcePathStyle 삭제
      // endpoint: config.get('TESTCASE_ENDPOINT_URL'),
      endpoint: config.get('STORAGE_BUCKET_ENDPOINT_URL'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.get('TESTCASE_ACCESS_KEY') ?? '',
        secretAccessKey: config.get('TESTCASE_SECRET_KEY') ?? ''
      }
    })
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
