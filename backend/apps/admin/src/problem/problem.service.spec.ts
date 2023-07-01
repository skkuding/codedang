import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { DifficultyInput } from './dto/update-problem.dto'
import { problems } from './mock/problem.mock'
import { ProblemService } from './problem.service'

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
      const result = await service.findAll({
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
      const result = await service.findOne({
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
      const result = await service.create({
        createdById: mockProblem0.createdById,
        groupId: mockProblem0.groupId,
        title: mockProblem0.title,
        description: mockProblem0.description,
        inputDescription: mockProblem0.inputDescription,
        outputDescription: mockProblem0.outputDescription,
        hint: mockProblem0.hint,
        timeLimit: mockProblem0.timeLimit,
        memoryLimit: mockProblem0.memoryLimit,
        difficulty: DifficultyInput.Level1,
        source: mockProblem0.source
      })

      // then
      expect(result).to.deep.equal(
        `${mockProblem0.title} has been successfully created with ID numbered ${mockProblem0.id}!`
      )
    })
  })

  describe('deleteGroupProblem', () => {
    it('should return a success message', async () => {
      // given
      db.problem.findUniqueOrThrow.resolves(mockProblem0)
      db.problem.delete.resolves(mockProblem0)

      // when
      const result = await service.remove({
        problemId: problemId
      })

      // then
      expect(result).to.deep.equal(
        `${mockProblem0.title} has been successfully deleted with ID numbered ${mockProblem0.id}!`
      )
    })
  })
})
