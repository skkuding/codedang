import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { ContentType, type Extension } from './content.type'

@Injectable()
export class StorageService {
  constructor(
    private readonly config: ConfigService,
    @Inject('S3_CLIENT') private readonly client: S3Client
  ) {}

  async uploadObject(path: string, content: string, extension: Extension) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.get('TESTCASE_BUCKET'),
        Key: `${path}.${extension}`,
        Body: content,
        ContentType: ContentType[extension]
      })
    )
  }

  // TODO: uploadFile
  // TODO: readFile
}
