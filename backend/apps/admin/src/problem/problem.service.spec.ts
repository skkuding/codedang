import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { Language } from '@admin/@generated/prisma/language.enum'
import { Level } from '@admin/@generated/prisma/level.enum'
import type { Problem } from '@admin/@generated/problem/problem.model'
import { ProblemService } from './problem.service'

export const problems: Problem[] = [
  {
    id: 1,
    createdById: 1,
    groupId: 1,
    title: 'group problem0',
    description: 'description1',
    inputDescription: 'inputDescription1',
    outputDescription: 'outputDescription1',
    hint: 'hit rather hint',
    languages: [Language.Cpp],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: 'mustard source',
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: [],
    problemTestcase: [],
    problemTag: []
  },
  {
    id: 2,
    createdById: 1,
    groupId: 1,
    title: 'group problem1',
    description: 'description2',
    inputDescription: 'inputDescription2',
    outputDescription: 'outputDescription2',
    hint: 'hit rather hint',
    languages: [Language.Cpp],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: 'soy source',
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: [],
    problemTestcase: [],
    problemTag: []
  }
]

const db = {
  problem: {
    findMany: stub(),
    findUnique: stub(),
    findUniqueOrThrow: stub(),
    create: stub(),
    createMany: stub(),
    update: stub(),
    delete: stub()
  }
}

const ARBITRARY_VAL = 1
const problemId = ARBITRARY_VAL
const groupId = ARBITRARY_VAL

const mockProblems = problems.map((problem) => {
  return Object.assign({}, problem)
})

const mockProblem0 = Object.assign({}, mockProblems[0])
const mockProblem1 = Object.assign({}, mockProblems[1])

describe('ProblemService', () => {
  let service: ProblemService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: db }, ProblemService]
    }).compile()

    service = module.get<ProblemService>(ProblemService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getGroupProblems', () => {
    it('should return group problems', async () => {
      // given
      db.problem.findMany.resolves(mockProblem1)

      // when
      const result = await service.getGroupProblems({
        groupId: groupId,
        cursor: ARBITRARY_VAL,
        take: ARBITRARY_VAL
      })

      // then
      expect(result).to.deep.equal(mockProblem1)
    })
  })

  describe('getGroupProblem', () => {
    it('should return a group problem', async () => {
      // given
      db.problem.findUniqueOrThrow.resolves(mockProblem0)

      // when
      const result = await service.getGroupProblem({
        problemId: problemId
      })

      // then
      expect(result).to.deep.equal(mockProblem0)
    })
  })

  describe('createGroupProblem', () => {
    it('should return a success message', async () => {
      // given
      db.problem.create.resolves(mockProblem0)

      // when
      const result = await service.createGroupProblem(
        mockProblem0.createdById,
        {
          groupId: mockProblem0.groupId,
          title: mockProblem0.title,
          description: mockProblem0.description,
          inputDescription: mockProblem0.inputDescription,
          outputDescription: mockProblem0.outputDescription,
          hint: mockProblem0.hint,
          timeLimit: mockProblem0.timeLimit,
          memoryLimit: mockProblem0.memoryLimit,
          difficulty: Level.Level1,
          source: mockProblem0.source,
          problemTestcase: [],
          problemTag: []
        }
      )

      // then
      expect(result).to.deep.equal(mockProblem0)
    })
  })

  describe('deleteGroupProblem', () => {
    it('should return a success message', async () => {
      // given
      db.problem.findUniqueOrThrow.resolves(mockProblem0)
      db.problem.delete.resolves(mockProblem0)

      // when
      const result = await service.deleteGroupProblem({
        problemId: problemId
      })

      // then
      expect(result).to.deep.equal(mockProblem0)
    })
  })
})
