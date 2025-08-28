import { ConfigModule, ConfigService } from '@nestjs/config'
import { S3Client } from '@aws-sdk/client-s3'

export const S3Provider = {
  provide: S3Client,
  import: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const endpoint = config.get<string>('MINIO_ENDPOINT_URL')
    if (endpoint) {
      return new S3Client({
        region: 'ap-northeast-2',
        forcePathStyle: true,
        endpoint
      })
    }

    return new S3Client({
      region: 'ap-northeast-2'
    })
  }
}
