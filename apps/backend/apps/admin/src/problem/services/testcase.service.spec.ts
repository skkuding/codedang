import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { Role } from '@prisma/client'
import * as archiver from 'archiver'
import { expect } from 'chai'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import * as StreamZipNs from 'node-stream-zip'
import { spy, stub } from 'sinon'
import { Readable } from 'stream'
import { PrismaService } from '@libs/prisma'
import { S3Provider, StorageService } from '@libs/storage'
import {
  exampleProblemTestcases,
  testcaseData,
  testcaseUploadInput,
  user
} from '../mock/mock'
import type { Testcase } from '../model/testcase.input'
import { FileService } from './file.service'
import { TestcaseService } from './testcase.service'

interface StreamZipAsyncLike {
  new (opts: { file: string }): {
    entries(): Promise<Record<string, { isDirectory: boolean }>>
    entryData(name: string): Promise<Buffer>
    close(): Promise<void>
  }
}

type StreamZipModuleWithDefault = { default: { async?: StreamZipAsyncLike } }
type StreamZipModuleDirect = { async?: StreamZipAsyncLike }
type StreamZipModule = StreamZipModuleWithDefault | StreamZipModuleDirect
const StreamZipModuleRef = StreamZipNs as unknown as StreamZipModule

const db = {
  problem: {
    findFirstOrThrow: stub(),
    findUnique: stub(),
    update: stub()
  },
  problemTestcase: {
    create: stub(),
    createMany: stub(),
    deleteMany: stub(),
    findMany: stub(),
    update: stub(),
    updateMany: stub()
  },
  $transaction: stub().callsFake(
    async (
      input: ((tx: typeof db) => Promise<unknown> | unknown) | unknown
    ) => {
      if (typeof input === 'function') {
        const fn = input as (tx: typeof db) => Promise<unknown> | unknown
        return fn(db)
      }
      throw new Error('Invalid transaction input')
    }
  )
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
        { provide: CACHE_MANAGER, useValue: { del: () => null } }
      ]
    }).compile()

    service = module.get<TestcaseService>(TestcaseService)
    storageService = module.get<StorageService>(StorageService)
    prismaService = module.get<PrismaService>(PrismaService)

    // reset shared stubs to avoid cross-test leakage
    db.problemTestcase.create.reset()
    db.problemTestcase.createMany.reset()
    db.problemTestcase.deleteMany.reset()
    db.problemTestcase.findMany.reset()
    db.problemTestcase.update.reset()
    db.problemTestcase.updateMany.reset()
    db.$transaction.resetBehavior()
    db.$transaction.callsFake(
      async (
        input: ((tx: typeof db) => Promise<unknown> | unknown) | unknown
      ) => {
        if (typeof input === 'function') {
          const fn = input as (tx: typeof db) => Promise<unknown> | unknown
          return fn(db)
        }
        throw new Error('Invalid transaction input')
      }
    )
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
          { provide: CACHE_MANAGER, useValue: { del: () => null } }
        ]
      }).compile()

      service = module.get<TestcaseService>(TestcaseService)
      storageService = module.get<StorageService>(StorageService)
    })

    it('should fail if problem id is not found', async () => {
      const problemId = 999
      const userId = 1
      const userRole = 'Admin' as Role

      await expect(
        service.createTestcases(testcases, problemId, userId, userRole)
      ).to.be.rejected
    })

    it('should create testcases', async () => {
      const problemId = 1
      const userId = 1
      const userRole = Role.Admin

      await service.createTestcases(testcases, problemId, userId, userRole)

      const uploadedFiles = await storageService.listObjects(
        `${problemId}/`,
        'testcase'
      )
      expect(uploadedFiles).to.have.lengthOf(6)
    })
  })

  describe('uploadTestcaseZip', () => {
    const problemId = 1
    const userId = 1
    const userRole = Role.Admin

    const file = {
      filename: 'testcase.zip',
      mimetype: 'application/zip',
      encoding: 'utf-8',
      createReadStream: () =>
        new Readable({
          read(this: Readable) {
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
          { provide: CACHE_MANAGER, useValue: { del: () => null } }
        ]
      }).compile()

      service = module.get<TestcaseService>(TestcaseService)
      storageService = module.get<StorageService>(StorageService)
    })

    it('should not allow if given file is not zip', async () => {
      const nonZipFile = { ...file, mimetype: 'text/plain' }

      await expect(
        service.uploadTestcaseZip(nonZipFile, problemId, userId, userRole)
      ).to.be.rejected
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
        service.uploadTestcaseZip(invalidZipFile, problemId, userId, userRole)
      ).to.be.rejected

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

      await service.uploadTestcaseZip(zipFile, problemId, userId, userRole)

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
        where: {
          problemId,
          isOutdated: false
        }
      })
      expect(entries).to.be.empty
    })
  })

  describe('getProblemTestcases', () => {
    it('should return a problem testcase array', async () => {
      db.problem.findUnique.resolves({
        isHiddenUploadedByZip: false,
        isSampleUploadedByZip: false
      })
      db.problemTestcase.findMany.reset()
      db.problemTestcase.findMany.resolves(exampleProblemTestcases)
      expect(await service.getProblemTestcases(1)).to.deep.equal(
        exampleProblemTestcases
      )
    })
  })
})

// Removed an additional describe block with unused variables to satisfy lint/type rules

// Helper function tests
describe('Helper Functions', () => {
  describe('GCD and LCM', () => {
    it('should calculate GCD correctly', () => {
      const gcd = (a: number, b: number): number =>
        b === 0 ? a : gcd(b, a % b)

      expect(gcd(12, 8)).to.equal(4)
      expect(gcd(15, 25)).to.equal(5)
      expect(gcd(7, 13)).to.equal(1)
    })

    it('should calculate LCM correctly', () => {
      const gcd = (a: number, b: number): number =>
        b === 0 ? a : gcd(b, a % b)
      const lcm = (a: number, b: number): number => (a * b) / gcd(a, b)

      expect(lcm(4, 6)).to.equal(12)
      expect(lcm(3, 5)).to.equal(15)
      expect(lcm(2, 8)).to.equal(8)
    })
  })
})
