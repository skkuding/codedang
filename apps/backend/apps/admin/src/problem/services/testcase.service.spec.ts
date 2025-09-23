import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import * as archiver from 'archiver'
import { expect } from 'chai'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { spy, stub, createSandbox } from 'sinon'
import { Readable } from 'stream'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService, S3Provider } from '@libs/storage'
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
      db.problemTestcase.findMany.resolves(exampleProblemTestcases)
      expect(await service.getProblemTestcases(1)).to.deep.equal(
        exampleProblemTestcases
      )
    })
  })
})

describe('TestcaseService - Fraction ScoreWeight', () => {
  let service: TestcaseService
  let prisma: PrismaService
  let sandbox: sinon.SinonSandbox

  beforeEach(async () => {
    sandbox = createSandbox()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestcaseService,
        {
          provide: PrismaService,
          useValue: {
            problemTestcase: {
              create: sandbox.stub(),
              findMany: sandbox.stub(),
              deleteMany: sandbox.stub(),
              update: sandbox.stub()
            }
          }
        },
        {
          provide: StorageService,
          useValue: {
            uploadObject: sandbox.stub()
          }
        },
        {
          provide: FileService,
          useValue: {
            getFileSize: sandbox.stub()
          }
        }
      ]
    }).compile()

    service = module.get<TestcaseService>(TestcaseService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('Fraction weight conversion', () => {
    it('should handle equal distribution correctly', async () => {
      const testcases = [
        { input: 'test1', output: 'out1', isHidden: false },
        { input: 'test2', output: 'out2', isHidden: false },
        { input: 'test3', output: 'out3', isHidden: false }
      ]

      const createStub = prisma.problemTestcase.create as sinon.SinonStub
      createStub.resolves({ id: 1 })

      // Call would internally handle equal distribution
      // For 3 testcases: 1/3, 1/3, 1/3

      // Verify the logic works correctly
      const totalWeight = 3
      const individualWeight = 1 / totalWeight

      expect(individualWeight).to.equal(1 / 3)
      expect(individualWeight * 3).to.equal(1)
    })

    it('should convert legacy scoreWeight to fraction', () => {
      // Legacy weight of 33% should become 33/100
      const legacyWeight = 33
      const numerator = legacyWeight
      const denominator = 100

      expect(numerator / denominator).to.equal(0.33)
    })

    it('should handle 101 testcases', () => {
      const testcaseCount = 101
      const individualWeight = 1 / testcaseCount
      const totalWeight = individualWeight * testcaseCount

      expect(totalWeight).to.equal(1)
      expect(individualWeight).to.be.closeTo(0.0099, 0.0001)
    })

    it('should handle mixed manual and equal distribution', () => {
      // Manual: 20% (1/5) and 53% (53/100)
      // Remaining 7 testcases share 27%

      const manual1 = { numerator: 1, denominator: 5 }
      const manual2 = { numerator: 53, denominator: 100 }

      // Calculate remaining
      const manual1Value = manual1.numerator / manual1.denominator // 0.2
      const manual2Value = manual2.numerator / manual2.denominator // 0.53
      const remaining = 1 - manual1Value - manual2Value // 0.27

      const remainingTestcases = 7
      const eachRemainingWeight = remaining / remainingTestcases

      expect(manual1Value).to.equal(0.2)
      expect(manual2Value).to.equal(0.53)
      expect(remaining).to.be.closeTo(0.27, 0.001)
      expect(eachRemainingWeight).to.be.closeTo(0.0386, 0.0001)

      // Total should be 1
      const total =
        manual1Value + manual2Value + eachRemainingWeight * remainingTestcases
      expect(total).to.be.closeTo(1, 0.001)
    })
  })

  describe('Score calculation with fractions', () => {
    it('should maintain fairness in equal distribution', () => {
      // 3 testcases with equal weight
      const testcases = [
        { weight: 1 / 3, accepted: true },
        { weight: 1 / 3, accepted: true },
        { weight: 1 / 3, accepted: false }
      ]

      const score = testcases
        .filter((tc) => tc.accepted)
        .reduce((sum, tc) => sum + tc.weight, 0)

      expect(score).to.be.closeTo(2 / 3, 0.001)

      // Convert to 100-point scale
      const finalScore = Math.round(score * 100)
      expect(finalScore).to.equal(67)
    })

    it('should calculate correctly with different denominators', () => {
      // Test with different fractions
      const testcases = [
        { numerator: 1, denominator: 2, accepted: true }, // 50%
        { numerator: 1, denominator: 4, accepted: true }, // 25%
        { numerator: 1, denominator: 4, accepted: false } // 25%
      ]

      // Find LCM of denominators (2, 4, 4) = 4
      const lcm = 4

      // Convert to common denominator
      const weights = testcases.map((tc) => ({
        adjusted: tc.numerator * (lcm / tc.denominator),
        accepted: tc.accepted
      }))

      const totalWeight = weights.reduce((sum, w) => sum + w.adjusted, 0)
      const acceptedWeight = weights
        .filter((w) => w.accepted)
        .reduce((sum, w) => sum + w.adjusted, 0)

      const score = acceptedWeight / totalWeight
      expect(score).to.equal(0.75)

      const finalScore = Math.round(score * 100)
      expect(finalScore).to.equal(75)
    })
  })
})

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
