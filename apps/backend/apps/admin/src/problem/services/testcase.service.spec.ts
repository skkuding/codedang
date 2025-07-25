import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import * as archiver from 'archiver'
import { expect } from 'chai'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { spy, stub } from 'sinon'
import { Readable } from 'stream'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService, S3MediaProvider, S3Provider } from '@libs/storage'
import {
  exampleProblemTestcases,
  testcaseData,
  testcaseUploadInput,
  user
} from '../mock/mock'
import type { Testcase } from '../model/testcase.input'
import { FileService } from './file.service'
import { TestcaseService } from './testcase.service'

const db = {
  problem: {
    findFirstOrThrow: stub()
  },
  problemTestcase: {
    create: stub(),
    createMany: stub(),
    deleteMany: stub(),
    findMany: stub(),
    update: stub()
  }
}

describe('TestcaseService', () => {
  let service: TestcaseService
  let prismaService: PrismaService
  let storageService: StorageService

  // Override testing module in this scope to use real PrismaService
  // TODO: Refactor to use real PrismaService, not mock
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestcaseService,
        { provide: PrismaService, useValue: db },
        FileService,
        StorageService,
        ConfigService,
        S3Provider,
        S3MediaProvider,
        { provide: CACHE_MANAGER, useValue: { del: () => null } }
      ]
    }).compile()

    service = module.get<TestcaseService>(TestcaseService)
    storageService = module.get<StorageService>(StorageService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('createTestcases', () => {
    const testcases: Testcase[] = [
      {
        input: 'input',
        output: 'output',
        isHidden: false,
        scoreWeight: 1
      },
      {
        input: 'input2',
        output: 'output2',
        isHidden: false
      },
      {
        input: 'input3',
        output: 'output3',
        isHidden: true
      }
    ]

    // Override testing module in this scope to use real PrismaService
    // TODO: Refactor to use real PrismaService, not mock
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TestcaseService,
          PrismaService,
          StorageService,
          FileService,
          ConfigService,
          S3Provider,
          S3MediaProvider,
          { provide: CACHE_MANAGER, useValue: { del: () => null } }
        ]
      }).compile()

      service = module.get<TestcaseService>(TestcaseService)
      storageService = module.get<StorageService>(StorageService)
    })

    it('should fail if problem id is not found', async () => {
      const problemId = 999

      await expect(
        service.createTestcases(testcases, problemId)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should create testcases', async () => {
      const problemId = 1

      await service.createTestcases(testcases, problemId)

      const uploadedFiles = await storageService.listObjects(
        `${problemId}/`,
        'testcase'
      )
      expect(uploadedFiles).to.have.lengthOf(6)
    })
  })

  describe('uploadTestcaseZip', () => {
    const problemId = 1

    const file = {
      filename: 'testcase.zip',
      mimetype: 'application/zip',
      encoding: 'utf-8',
      createReadStream: () =>
        new Readable({
          read() {
            this.push('testcase content')
            this.push(null)
          }
        })
    } satisfies FileUpload

    // Override testing module in this scope to use real PrismaService
    // TODO: Refactor to use real PrismaService, not mock
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TestcaseService,
          FileService,
          PrismaService,
          StorageService,
          ConfigService,
          S3Provider,
          S3MediaProvider,
          { provide: CACHE_MANAGER, useValue: { del: () => null } }
        ]
      }).compile()

      service = module.get<TestcaseService>(TestcaseService)
      storageService = module.get<StorageService>(StorageService)
    })

    it('should not allow if given file is not zip', async () => {
      const nonZipFile = { ...file, mimetype: 'text/plain' }

      await expect(
        service.uploadTestcaseZip(nonZipFile, problemId)
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should not allow testcase files without corresponding input/output', async () => {
      const invalidZipStream = () => {
        const archive = archiver('zip', { zlib: { level: 9 } })
        archive.append('Content for 1.in', { name: '1.in' })
        archive.append('Content for 1.out', { name: '1.out' })
        archive.append('Content for 2.in', { name: '2.in' })
        archive.append('Content for 2.out', { name: '2.out' })
        archive.append('Content for 3.in', { name: '3.in' })
        archive.finalize()
        return archive
      }

      const invalidZipFile = {
        ...file,
        createReadStream: invalidZipStream
      } satisfies FileUpload

      await expect(
        service.uploadTestcaseZip(invalidZipFile, problemId)
      ).to.be.rejectedWith(UnprocessableDataException)

      const uploadedFiles = await storageService.listObjects(
        `${problemId}/`,
        'testcase'
      )
      expect(uploadedFiles).to.be.empty
    })

    it('should upload testcase files', async () => {
      const createZipStream = () => {
        const archive = archiver('zip', { zlib: { level: 9 } })
        archive.append('Content for 1.in', { name: '1.in' })
        archive.append('Content for 1.out', { name: '1.out' })
        archive.append('Content for 2.in', { name: '2.in' })
        archive.append('Content for 2.out', { name: '2.out' })
        archive.finalize()
        return archive
      }

      const zipFile = {
        ...file,
        createReadStream: createZipStream
      } satisfies FileUpload

      await service.uploadTestcaseZip(zipFile, problemId)

      const uploadedFiles = await storageService.listObjects(
        `${problemId}/`,
        'testcase'
      )
      expect(uploadedFiles).to.have.lengthOf(4)
    })
  })

  describe('uploadTestcase', () => {
    it('should return imported testcase', async () => {
      const problemId = 2
      const createTestcaseSpy = spy(service, 'createTestcaseLegacy')
      db.problemTestcase.create.resetHistory()
      db.problemTestcase.create.resolves(testcaseData)

      const result = await service.uploadTestcase(
        testcaseUploadInput,
        problemId,
        user[0].role!,
        user[0].id!
      )

      expect(createTestcaseSpy.calledOnce).to.be.true
      expect(result).to.deep.equal(testcaseData)
    })
  })

  describe('removeAllTestcaseFiles', () => {
    // Override testing module in this scope to use real PrismaService
    // TODO: Refactor to use real PrismaService, not mock
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TestcaseService,
          FileService,
          PrismaService,
          StorageService,
          ConfigService,
          S3Provider,
          S3MediaProvider,
          { provide: CACHE_MANAGER, useValue: { del: () => null } }
        ]
      }).compile()

      service = module.get<TestcaseService>(TestcaseService)
      storageService = module.get<StorageService>(StorageService)
      prismaService = module.get<PrismaService>(PrismaService)
    })

    it('should remove all testcase files', async () => {
      const problemId = 1
      const files = [
        `${problemId}/1.in`,
        `${problemId}/1.out`,
        `${problemId}/2.in`,
        `${problemId}/2.out`,
        `${problemId}/3.in`,
        `${problemId}/3.out`
      ]

      await Promise.all(
        files.map((file) =>
          storageService.uploadObject(file, 'dummy text', 'txt')
        )
      )

      const uploadedFiles = await storageService.listObjects(
        `${problemId}/`,
        'testcase'
      )
      expect(uploadedFiles).to.be.not.empty

      await service.removeAllTestcaseFiles(problemId)

      const existingFiles = await storageService.listObjects(
        `${problemId}/`,
        'testcase'
      )
      expect(existingFiles).to.be.empty

      const entries = await prismaService.problemTestcase.findMany({
        where: { problemId }
      })
      expect(entries).to.be.empty
    })
  })

  describe('getProblemTestcases', () => {
    it('should return a problem testcase array', async () => {
      db.problemTestcase.findMany.resolves(exampleProblemTestcases)
      expect(await service.getProblemTestcases(1)).to.deep.equal(
        exampleProblemTestcases
      )
    })
  })
})
