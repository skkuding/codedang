import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

@Injectable()
export class StorageService {
  constructor(
    private readonly config: ConfigService,
    @Inject('S3_CLIENT') private readonly client: S3Client
  ) {}

  async uploadObject(path: string, contents: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.get('TESTCASE_BUCKET'),
        Key: path,
        Body: contents
      })
    )
  }

  // TODO: uploadFile
  // TODO: readFile
}
