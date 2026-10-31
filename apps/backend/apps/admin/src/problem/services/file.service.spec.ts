import type { ConfigService } from '@nestjs/config'
import { expect } from 'chai'
import { stub } from 'sinon'
import { Readable } from 'stream'
import type { PrismaService } from '@libs/prisma'
import type { StorageService } from '@libs/storage'
import type { UploadFileInput } from '../model/problem.input'
import { FileService } from './file.service'

const createService = (env: [string, string][]) => {
  const prisma = { file: { create: stub().resolves() } }
  const storage = { uploadFile: stub().resolves(), deleteFile: stub() }
  const values = new Map(env)
  const config = { get: (key: string) => values.get(key) }

  return new FileService(
    prisma as unknown as PrismaService,
    storage as unknown as StorageService,
    config as unknown as ConfigService
  )
}

const imageInput = () =>
  ({
    file: Promise.resolve({
      mimetype: 'image/png',
      createReadStream: () => Readable.from([Buffer.from('png')])
    })
  }) as unknown as UploadFileInput

const UUID = /[0-9a-f-]{36}$/

describe('FileService', () => {
  describe('uploadFile', () => {
    it('should return a CDN URL when MEDIA_CDN_URL is set', async () => {
      const service = createService([
        ['MEDIA_CDN_URL', 'https://media.codedang.com/'],
        ['MEDIA_BUCKET_NAME', 'codedang-media']
      ])

      const { src } = await service.uploadFile(imageInput(), 1, true)

      expect(src).to.match(/^https:\/\/media\.codedang\.com\/[^/]+$/)
      expect(src).to.match(UUID)
    })

    it('should return a MinIO URL when only MINIO_ENDPOINT_URL is set', async () => {
      const service = createService([
        ['MINIO_ENDPOINT_URL', 'https://minio.stage.codedang.com'],
        ['MEDIA_BUCKET_NAME', 'codedang-media']
      ])

      const { src } = await service.uploadFile(imageInput(), 1, true)

      expect(src).to.match(
        /^https:\/\/minio\.stage\.codedang\.com\/codedang-media\/[^/]+$/
      )
    })

    it('should return an S3 URL when no endpoint is set', async () => {
      const service = createService([['MEDIA_BUCKET_NAME', 'codedang-media']])

      const { src } = await service.uploadFile(imageInput(), 1, true)

      expect(src).to.match(
        /^https:\/\/codedang-media\.s3\.ap-northeast-2\.amazonaws\.com\/[^/]+$/
      )
    })
  })
})
