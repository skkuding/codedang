import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  paginateListObjectsV2,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  S3Client,
  type _Object
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import type { ReadStream } from 'fs'
import { type ContentType, ContentTypes } from './content.type'

export type S3BucketType = 'testcase' | 'media' | 'checkResult' | 'mandeuldang'

const MAX_DELETE_OBJECTS = 1000
@Injectable()
export class StorageService {
  constructor(
    private readonly config: ConfigService,
    private readonly client: S3Client
  ) {}

  private getBucketName(bucket: S3BucketType): string {
    switch (bucket) {
      case 'testcase':
        return this.config.getOrThrow('TESTCASE_BUCKET_NAME')
      case 'media':
        return this.config.getOrThrow('MEDIA_BUCKET_NAME')
      case 'checkResult':
        return this.config.getOrThrow('CHECK_RESULT_BUCKET_NAME')
      case 'mandeuldang':
        return this.config.getOrThrow('MANDEULDANG_BUCKET_NAME')
    }
  }
  /**
   * Upload a file object to S3 Bucket
   *
   * Object(testcase)를 업로드합니다.
   * @param filename 파일 이름
   * @param content 파일 내용
   * @param type 업로드할 파일의 MIME type
   * @param tags S3 Object에 붙일 태그
   * @param bucket 업로드할 Bucket 종류 (기본값: 'testcase')
   */
  async uploadObject(
    filename: string,
    content: string,
    type: ContentType,
    tags?: Record<string, string>,
    bucket: S3BucketType = 'testcase'
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
        Bucket: this.getBucketName(bucket),
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
        Bucket: this.getBucketName('media'),
        Key: filename,
        Body: content,
        ContentType: type,
        ContentLength: fileSize
      })
    )
  }

  /**
   * Object(Check Result)를 불러옵니다.
   * @param filename 파일 이름
   * @returns S3에 저장된 Object
   */
  async readObject(filename: string, bucket: 'checkResult' | 'mandeuldang') {
    const res = await this.client.send(
      new GetObjectCommand({
        Bucket: this.getBucketName(bucket),
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
   * @param bucket 조회할 Bucket 종류 ('testcase' | 'media' | 'checkResult' | 'mandeuldang')
   */
  async listObjects(
    prefix: string,
    bucket: 'testcase' | 'media' | 'checkResult' | 'mandeuldang'
  ) {
    const bucketName = this.getBucketName(bucket)

    const paginator = paginateListObjectsV2(
      { client: this.client },
      { Bucket: bucketName, Prefix: prefix }
    )

    const objects: _Object[] = []
    for await (const page of paginator) {
      if (page.Contents) {
        objects.push(...page.Contents)
      }
    }
    return objects
  }
  /**
   * Remove the object from S3 Bucket.
   *
   * @param filename 파일 이름
   * @param bucket Bucket type to delete from ('testcase' or 'media')
   */
  async deleteObject(
    filename: string,
    bucket: 'testcase' | 'media' | 'checkResult' | 'mandeuldang'
  ) {
    const bucketName = this.getBucketName(bucket)
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: filename
      })
    )
  }

  /**
   * 여러 Object를 한 번의 요청으로 삭제합니다. (요청당 최대 1000개)
   * 일부 Object 삭제에 실패하면 실패한 key 목록과 함께 에러를 던집니다.
   *
   * @param keys 삭제할 Object key 목록
   * @param bucket 삭제할 Bucket 종류
   */
  async deleteObjects(keys: string[], bucket: S3BucketType) {
    const bucketName = this.getBucketName(bucket)
    const failedKeys: string[] = []

    for (let i = 0; i < keys.length; i += MAX_DELETE_OBJECTS) {
      const chunk = keys.slice(i, i + MAX_DELETE_OBJECTS)
      const { Errors } = await this.client.send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: { Objects: chunk.map((key) => ({ Key: key })), Quiet: true }
        })
      )

      failedKeys.push(...(Errors ?? []).map((e) => e.Key ?? '(unknown key)'))
    }
    if (failedKeys.length > 0) {
      throw new Error(
        `Failed to delete ${failedKeys.length} object(s) from ${bucket}: ${failedKeys.join(', ')}`
      )
    }
  }
  /**
   * S3에 저장된 파일을 삭제합니다.
   * @param filename 파일 이름
   */
  async deleteFile(filename: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.getBucketName('media'),
        Key: filename
      })
    )
  }

  /**
   * S3 Object의 크기(Byte)를 가져옵니다.
   * HeadObjectCommand를 사용하여 파일 본문 다운로드 없이 메타데이터만 조회합니다.
   *
   * @param filename 파일 이름 (Key)
   * @param bucket Bucket 종류
   */
  async getObjectSize(
    filename: string,
    bucket: S3BucketType = 'testcase'
  ): Promise<number> {
    const command = new HeadObjectCommand({
      Bucket: this.getBucketName(bucket),
      Key: filename
    })

    const response = await this.client.send(command)
    return response.ContentLength ?? 0
  }
}
