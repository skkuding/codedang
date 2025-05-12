import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaService } from '@libs/prisma'
import { ProblemTestcaseCreateManyInput } from '@admin/@generated'
import { ProblemService } from '@admin/problem/problem.service'
import { S3Provider, S3MediaProvider } from '@admin/storage/s3.provider'
import { StorageService } from '@admin/storage/storage.service'
import { TestcaseService } from './testcase.service'

describe('TestcaseService', () => {
  let service: TestcaseService
  let storageService: StorageService
  let prismaService: PrismaService
  let problemService: ProblemService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestcaseService,
        StorageService,
        PrismaService,
        ProblemService,
        ConfigService,
        S3Provider,
        S3MediaProvider
      ]
    }).compile()

    service = module.get<TestcaseService>(TestcaseService)
    storageService = module.get<StorageService>(StorageService)
    prismaService = module.get<PrismaService>(PrismaService)
    problemService = module.get<ProblemService>(ProblemService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getTestcases', () => {
    it('should return testcases if input/output are stored in database', async () => {
      const problemId = 1
      const testcases = [
        {
          problemId,
          order: 1,
          scoreWeight: 1,
          input: '1 2',
          output: '3'
        },
        {
          problemId,
          order: 2,
          scoreWeight: 1,
          input: '3 4',
          output: '7'
        }
      ] satisfies ProblemTestcaseCreateManyInput[]

      await problemService.removeAllTestcaseFiles(problemId)
      await prismaService.problemTestcase.createMany({
        data: testcases
      })

      const result = await service.getTestcases(problemId)
      expect(result.length).to.equal(2)
      expect(result[0].problemId).to.equal(problemId)
      expect(result[0].input).to.equal(testcases[0].input)
      expect(result[0].output).to.equal(testcases[0].output)
      expect(result[1].problemId).to.equal(problemId)
      expect(result[1].input).to.equal(testcases[1].input)
      expect(result[1].output).to.equal(testcases[1].output)

      await problemService.removeAllTestcaseFiles(problemId)
    })

    it('should return testcases if input/output are stored in s3', async () => {
      const problemId = 1
      const testcases = [
        {
          problemId,
          order: 1,
          scoreWeight: 1
        },
        {
          problemId,
          order: 2,
          scoreWeight: 1
        }
      ] satisfies ProblemTestcaseCreateManyInput[]

      await problemService.removeAllTestcaseFiles(problemId)
      const testcaseIds =
        await prismaService.problemTestcase.createManyAndReturn({
          data: testcases,
          select: { id: true }
        })

      const inFilename1 = `${problemId}/${testcaseIds[0].id}.in`
      const outFilename1 = `${problemId}/${testcaseIds[0].id}.out`
      await storageService.uploadObject(inFilename1, '123 123', 'txt')
      await storageService.uploadObject(outFilename1, '246', 'txt')

      const inFilename2 = `${problemId}/${testcaseIds[1].id}.in`
      const outFilename2 = `${problemId}/${testcaseIds[1].id}.out`
      await storageService.uploadObject(inFilename2, '1000 2000', 'txt')
      await storageService.uploadObject(outFilename2, '3000', 'txt')

      const result = await service.getTestcases(problemId)
      expect(result.length).to.equal(2)
      expect(result[0].problemId).to.equal(problemId)
      expect(result[0].input).to.equal('123 123')
      expect(result[0].output).to.equal('246')
      expect(result[1].problemId).to.equal(problemId)
      expect(result[1].input).to.equal('1000 2000')
      expect(result[1].output).to.equal('3000')

      await problemService.removeAllTestcaseFiles(problemId)
    })

    it('should return empty array if no testcases found', async () => {
      const problemId = 1

      await problemService.removeAllTestcaseFiles(problemId)

      const result = await service.getTestcases(problemId)
      expect(result.length).to.equal(0)
    })

    it('should mark isTruncated as true if input/output are truncated', async () => {
      const problemId = 1
      const testcases = [
        {
          problemId,
          order: 1,
          scoreWeight: 1
        }
      ] satisfies ProblemTestcaseCreateManyInput[]

      await problemService.removeAllTestcaseFiles(problemId)
      const testcaseIds =
        await prismaService.problemTestcase.createManyAndReturn({
          data: testcases,
          select: { id: true }
        })

      const inFilename = `${problemId}/${testcaseIds[0].id}.in`
      const outFilename = `${problemId}/${testcaseIds[0].id}.out`
      const longText = '1234567890'.repeat(3000)
      await storageService.uploadObject(inFilename, longText, 'txt')
      await storageService.uploadObject(outFilename, '246', 'txt')

      const result = await service.getTestcases(problemId, 5)
      expect(result.length).to.equal(1)
      expect(result[0].isTruncated).to.equal(true)

      await problemService.removeAllTestcaseFiles(problemId)
    })
  })
})
