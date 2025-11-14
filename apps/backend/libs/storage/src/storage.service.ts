import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  DeleteObjectCommand,
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
    private readonly client: S3Client
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
    await this.client.send(
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
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.get('MEDIA_BUCKET_NAME'),
        Key: filename
      })
    )
  }
}
