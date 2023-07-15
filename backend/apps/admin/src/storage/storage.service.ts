import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { type ContentType, ContentTypes } from './content.type'

@Injectable()
export class StorageService {
  constructor(
    private readonly config: ConfigService,
    @Inject('S3_CLIENT') private readonly client: S3Client
  ) {}

  async uploadObject(filename: string, content: string, type: ContentType) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.get('TESTCASE_BUCKET_NAME'),
        Key: filename,
        Body: content,
        ContentType: ContentTypes[type]
      })
    )
  }

  // TODO: uploadFile
  // TODO: readFile
}
