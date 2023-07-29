import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { createReadStream } from 'fs'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { S3Provider } from '@admin/storage/s3.provider'
import { StorageService } from '@admin/storage/storage.service'
import type { FileUploadDto } from './dto/file-upload.dto'
import { problems } from './mock/mock'
import type { FileUploadInput } from './model/problem.input'
import { ProblemService } from './problem.service'

const file: Promise<FileUploadDto> = new Promise((resolve) => {
  const data = {
    createReadStream: () =>
      createReadStream('apps/admin/src/problem/mock/testdata.xlsx'),
    filename: 'testdata.xlsx',
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    encoding: '7bit'
  }
  resolve(data)
})
const fileUploadInput: FileUploadInput = {
  file
}

const db = {
  problem: {
    create: stub()
  },
  problemTestcase: {
    createMany: stub()
  }
}

describe('ProblemService', () => {
  let service: ProblemService
  let storageService: StorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemService,
        { provide: PrismaService, useValue: db },
        StorageService,
        S3Provider,
        ConfigService
      ]
    }).compile()

    service = module.get<ProblemService>(ProblemService)
    storageService = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('importProblems', () => {
    it('shoule return imported problems', async () => {
      const userId = 2
      const groupId = 2
      const s3UploadCache = stub(storageService, 'uploadObject').resolves()
      db.problem.create.onCall(0).resolves(problems[0])
      db.problem.create.onCall(1).resolves(problems[1])
      db.problemTestcase.createMany.resolves()

      const res = await service.importProblems(userId, groupId, fileUploadInput)

      expect(s3UploadCache.calledTwice).to.be.true
      expect(res).to.deep.equal(problems)
    })
  })
})
