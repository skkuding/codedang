import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
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
   * Upload a file object to S3 Bucket
   *
   * Object(testcase)를 업로드합니다.
   * @param filename 파일 이름
   * @param content 파일 내용
   * @param type 업로드할 파일의 MIME type
   * @param tags S3 Object에 붙일 태그
   */
  async uploadObject(
    filename: string,
    content: string,
    type: ContentType,
    tags?: Record<string, string>
  ) {
    const tagging = Object.entries(tags ?? {})
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join('&')

    const upload = new Upload({
      client: this.client, // your S3 client
      params: {
        Bucket: this.config.get('TESTCASE_BUCKET_NAME'),
        Key: filename, // or your desired filename
        Body: content,
        ContentType: ContentTypes[type],
        Tagging: tagging
      }
    })

    const output = await upload.done()
    return output
  }

  /**
   * 이미지를 S3 Bucket에 업로드합니다.
   * TODO: Integrate this function with uploadObject
   *
   * @param filename 파일 이름
   * @param fileSize 파일 크기 (Byte)
   * @param content 파일 내용 (ReadStream type)
   * @param type 업로드할 파일의 MIME type
   */
  async uploadFile({
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

  /**
   * S3 Bucket에서 파일을 읽어옵니다.
   *
   * @param filename 파일 이름
   * @param bucket Bucket type to read from ('testcase' or 'media')
   * @param options Optional parameters
   * @param options.readBytes Read only a certain number of bytes
   */
  async readObject(
    filename: string,
    bucket: 'testcase' | 'media',
    options?: {
      readBytes?: number
    }
  ) {
    const bucketName = this.config.get(
      bucket == 'testcase' ? 'TESTCASE_BUCKET_NAME' : 'MEDIA_BUCKET_NAME'
    )

    const head = await this.client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: filename
      })
    )
    const size = head.ContentLength ?? 0
    const range =
      options?.readBytes && size > options.readBytes
        ? `bytes=0-${options.readBytes}`
        : undefined

    const output = await this.client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Range: range
      })
    )
    if (output.Body == null) {
      throw new Error('File not found')
    }

    const text = await output.Body.transformToString()
    return text
  }

  /**
   * List files in S3 Bucket under the given prefix.
   * For example, if prefix is 'testcase/', it will list all files under 'testcase/'.
   *
   * @param prefix Directory name to list files from
   * @param bucket Bucket type to list files from ('testcase' or 'media')
   */
  async listObjects(prefix: string, bucket: 'testcase' | 'media') {
    const bucketName = this.config.get(
      bucket == 'testcase' ? 'TESTCASE_BUCKET_NAME' : 'MEDIA_BUCKET_NAME'
    )
    const objects = await this.client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix
      })
    )
    return objects.Contents ?? []
  }

  /**
   * Remove the object from S3 Bucket.
   *
   * @param filename 파일 이름
   * @param bucket Bucket type to delete from ('testcase' or 'media')
   */
  async deleteObject(filename: string, bucket: 'testcase' | 'media') {
    const bucketName = this.config.get(
      bucket == 'testcase' ? 'TESTCASE_BUCKET_NAME' : 'MEDIA_BUCKET_NAME'
    )
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: filename
      })
    )
  }

  /**
   * S3에 저장된 파일을 삭제합니다.
   * @param filename 파일 이름
   */
  async deleteFile(filename: string) {
    await this.mediaClient.send(
      new DeleteObjectCommand({
        Bucket: this.config.get('MEDIA_BUCKET_NAME'),
        Key: filename
      })
    )
  }
}
