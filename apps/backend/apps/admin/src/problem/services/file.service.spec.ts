import type { ConfigService } from '@nestjs/config'
import { FileStatus } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import { stub } from 'sinon'
import { Readable } from 'stream'
import { MAX_IMAGE_SIZE } from '@libs/constants'
import {
  UnprocessableDataException,
  UnprocessableFileDataException
} from '@libs/exception'
import type { PrismaService } from '@libs/prisma'
import type { StorageService } from '@libs/storage'
import type { UploadFileInput } from '../model/problem.input'
import { FileService } from './file.service'

const createService = (env: [string, string][] = []) => {
  const prisma = { file: { create: stub().resolves() } }
  const storage = { uploadFile: stub().resolves(), deleteFile: stub() }
  const values = new Map(env)
  const config = { get: (key: string) => values.get(key) }

  const service = new FileService(
    prisma as unknown as PrismaService,
    storage as unknown as StorageService,
    config as unknown as ConfigService
  )
  return { service, prisma, storage }
}

const fileInput = (mimetype: string, content: Buffer = Buffer.from('data')) =>
  ({
    file: Promise.resolve({
      mimetype,
      createReadStream: () => Readable.from([content])
    })
  }) as unknown as UploadFileInput

const imageInput = () => fileInput('image/png')
const pdfInput = () => fileInput('application/pdf')

const UUID = /[0-9a-f-]{36}$/
const UUID_EXACT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const prismaError = () =>
  new PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test'
  })

describe('FileService', () => {
  describe('uploadFile', () => {
    it('should return a CDN URL when MEDIA_CDN_URL is set', async () => {
      const { service } = createService([
        ['MEDIA_CDN_URL', 'https://media.codedang.com/'],
        ['MEDIA_BUCKET_NAME', 'codedang-media']
      ])

      const { src } = await service.uploadFile(imageInput(), 1, true)

      expect(src).to.match(/^https:\/\/media\.codedang\.com\/[^/]+$/)
      expect(src).to.match(UUID)
    })

    it('should return a MinIO URL when only MINIO_ENDPOINT_URL is set', async () => {
      const { service } = createService([
        ['MINIO_ENDPOINT_URL', 'https://minio.stage.codedang.com'],
        ['MEDIA_BUCKET_NAME', 'codedang-media']
      ])

      const { src } = await service.uploadFile(imageInput(), 1, true)

      expect(src).to.match(
        /^https:\/\/minio\.stage\.codedang\.com\/codedang-media\/[^/]+$/
      )
    })

    it('should return an S3 URL when no endpoint is set', async () => {
      const { service } = createService([
        ['MEDIA_BUCKET_NAME', 'codedang-media']
      ])

      const { src } = await service.uploadFile(imageInput(), 1, true)

      expect(src).to.match(
        /^https:\/\/codedang-media\.s3\.ap-northeast-2\.amazonaws\.com\/[^/]+$/
      )
    })

    it('should create the file as Unmanaged and return only src', async () => {
      const { service, prisma } = createService([
        ['MEDIA_BUCKET_NAME', 'codedang-media']
      ])

      const result = await service.uploadFile(imageInput(), 7, true)

      expect(result).to.have.all.keys('src')
      expect(prisma.file.create.calledOnce).to.be.true
      const { data } = prisma.file.create.firstCall.args[0]
      expect(data.status).to.equal(FileStatus.Unmanaged)
      expect(data.createdById).to.equal(7)
      expect(result.src.endsWith(data.filename)).to.be.true
    })
  })

  describe('uploadProblemAttachment', () => {
    it('should create an image as Temporary and return only attachmentId', async () => {
      const { service, prisma, storage } = createService()

      const result = await service.uploadProblemAttachment(
        imageInput(),
        7,
        true
      )

      expect(result).to.have.all.keys('attachmentId')
      expect(result.attachmentId).to.match(UUID_EXACT)
      const { data } = prisma.file.create.firstCall.args[0]
      expect(data).to.deep.equal({
        filename: result.attachmentId,
        createdById: 7,
        status: FileStatus.Temporary
      })
      expect(storage.uploadFile.firstCall.args[0].filename).to.equal(
        result.attachmentId
      )
    })

    it('should create a PDF as Temporary', async () => {
      const { service, prisma } = createService()

      const { attachmentId } = await service.uploadProblemAttachment(
        pdfInput(),
        7,
        false
      )

      const { data } = prisma.file.create.firstCall.args[0]
      expect(data.filename).to.equal(attachmentId)
      expect(data.status).to.equal(FileStatus.Temporary)
    })

    it('should reject a non-image file for the image API', async () => {
      const { service, storage, prisma } = createService()

      await expect(
        service.uploadProblemAttachment(pdfInput(), 7, true)
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'Only image files can be accepted'
      )
      expect(storage.uploadFile.called).to.be.false
      expect(prisma.file.create.called).to.be.false
    })

    it('should reject a non-PDF file for the file API', async () => {
      const { service, storage, prisma } = createService()

      await expect(
        service.uploadProblemAttachment(imageInput(), 7, false)
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'Only pdf files can be accepted'
      )
      expect(storage.uploadFile.called).to.be.false
      expect(prisma.file.create.called).to.be.false
    })

    it('should reject an image larger than the maximum size', async () => {
      const { service, storage, prisma } = createService()
      const oversized = fileInput('image/png', Buffer.alloc(MAX_IMAGE_SIZE + 1))

      await expect(
        service.uploadProblemAttachment(oversized, 7, true)
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'File size exceeds maximum limit'
      )
      expect(storage.uploadFile.called).to.be.false
      expect(prisma.file.create.called).to.be.false
    })

    it('should delete the uploaded object when saving the file record fails', async () => {
      const { service, storage, prisma } = createService()
      prisma.file.create.rejects(prismaError())

      await expect(
        service.uploadProblemAttachment(imageInput(), 7, true)
      ).to.be.rejectedWith(UnprocessableFileDataException)

      const uploaded = storage.uploadFile.firstCall.args[0].filename
      expect(storage.deleteFile.calledOnceWithExactly(uploaded)).to.be.true
    })

    it('should not create a file record when the storage upload fails', async () => {
      const { service, storage, prisma } = createService()
      storage.uploadFile.rejects(new Error('S3 unavailable'))

      await expect(
        service.uploadProblemAttachment(imageInput(), 7, true)
      ).to.be.rejectedWith(UnprocessableFileDataException)

      expect(prisma.file.create.called).to.be.false
      expect(storage.deleteFile.called).to.be.false
    })
  })

  describe('deleteFile', () => {
    const FILENAME = '0f8fad5b-d9cb-469f-a165-70867728950e'
    const USER_ID = 1

    const setup = (status: FileStatus | null) => {
      const file = status && {
        filename: FILENAME,
        createdById: USER_ID,
        createTime: new Date('2026-11-17T00:00:00Z'),
        status,
        problemId: null
      }
      const prisma = {
        file: {
          findFirst: stub().resolves(file),
          deleteMany: stub(),
          delete: stub()
        }
      }
      const storage = { deleteFile: stub() }
      const service = new FileService(
        prisma as unknown as PrismaService,
        storage as unknown as StorageService,
        { get: () => undefined } as unknown as ConfigService
      )
      return { service, prisma, storage, file }
    }

    const expectNothingDeleted = (
      prisma: ReturnType<typeof setup>['prisma'],
      storage: ReturnType<typeof setup>['storage']
    ) => {
      expect(prisma.file.deleteMany.called).to.be.false
      expect(prisma.file.delete.called).to.be.false
      expect(storage.deleteFile.called).to.be.false
    }

    for (const status of [FileStatus.Temporary, FileStatus.Unmanaged]) {
      it(`should keep a ${status} file and return it`, async () => {
        const { service, prisma, storage, file } = setup(status)

        expect(await service.deleteFile(FILENAME, USER_ID)).to.equal(file)
        expect(
          prisma.file.findFirst.calledOnceWithExactly({
            where: { filename: FILENAME, createdById: USER_ID }
          })
        ).to.be.true
        expectNothingDeleted(prisma, storage)
      })
    }

    it('should reject attached files', async () => {
      const { service, prisma, storage } = setup(FileStatus.Attached)

      await expect(service.deleteFile(FILENAME, USER_ID)).to.be.rejectedWith(
        UnprocessableDataException
      )
      expectNothingDeleted(prisma, storage)
    })

    it("should reject a missing file or another user's file", async () => {
      const { service, prisma, storage } = setup(null)

      await expect(service.deleteFile(FILENAME, USER_ID)).to.be.rejectedWith(
        UnprocessableDataException
      )
      expectNothingDeleted(prisma, storage)
    })
  })
})
