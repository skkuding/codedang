import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import type { ReadStream } from 'fs'
import { type ContentType, ContentTypes } from './content.type'

@Injectable()
export class StorageService {
  constructor(
    private readonly config: ConfigService,
    @Inject('S3_CLIENT') private readonly client: S3Client,
    @Inject('S3_CLIENT_MEDIA') private readonly mediaClient: S3Client
  ) {}

  /**
   * @deprecated testcase를 더 이상 S3에 저장하지 않습니다.
   *
   * Object(testcase)를 업로드합니다.
   * @param filename 파일 이름
   * @param content 파일 내용
   * @param type 업로드할 파일의 MIME type
   */
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

  /**
   * 이미지를 S3 Bucket에 업로드합니다.
   * @param filename 이미지 파일 이름
   * @param fileSize 이미지 파일 크기 (Byte)
   * @param content 이미지 파일 내용 (ReadStream type)
   * @param type 업로드할 이미지 파일의 MIME type
   */
  async uploadImage({
    filename,
    fileSize,
    content,
    type
  }: {
    filename: string
    fileSize: number
    content: ReadStream
    type: string
  }) {
    await this.mediaClient.send(
      new PutObjectCommand({
        Bucket: this.config.get('MEDIA_BUCKET_NAME'),
        Key: filename,
        Body: content,
        ContentType: type,
        ContentLength: fileSize
      })
    )
  }

  // TODO: uploadFile

  /**
   * @deprecated testcase를 더 이상 S3에 저장하지 않습니다.
   *
   * Object(testcase)를 불러옵니다.
   * @param filename 파일 이름
   * @returns S3에 저장된 Object
   */
  async readObject(filename: string) {
    const res = await this.client.send(
      new GetObjectCommand({
        Bucket: this.config.get('TESTCASE_BUCKET_NAME'),
        Key: filename
      })
    )
    return res.Body?.transformToString() ?? ''
  }

  /**
   * @deprecated testcase를 더 이상 S3에 저장하지 않습니다.
   *
   * S3에 저장된 Object(testcase)를 삭제합니다.
   * @param filename 파일 이름
   */
  async deleteObject(filename: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.get('TESTCASE_BUCKET_NAME'),
        Key: filename
      })
    )
  }

  /**
   * S3에 저장된 이미지를 삭제합니다.
   * @param filename 이미지 파일 이름
   */
  async deleteImage(filename: string) {
    await this.mediaClient.send(
      new DeleteObjectCommand({
        Bucket: this.config.get('MEDIA_BUCKET_NAME'),
        Key: filename
      })
    )
  }
}
