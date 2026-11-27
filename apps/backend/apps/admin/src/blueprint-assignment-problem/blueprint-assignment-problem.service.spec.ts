import { Test, type TestingModule } from '@nestjs/testing'
import { Role } from '@prisma/client'
import { expect } from 'chai'
import { stub, type SinonStub } from 'sinon'
import { AuthenticatedUser } from '@libs/auth'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import { BlueprintAssignmentProblemService } from './blueprint-assignment-problem.service'

const user = new AuthenticatedUser(1, 'professor', Role.User)
const blueprintAssignmentId = 10
const blueprintCourseId = 100

const bap = (problemId: number, order: number, score = 10) => ({
  blueprintAssignmentId,
  problemId,
  order,
  score,
  createTime: new Date(),
  updateTime: new Date()
})

const createDb = () => ({
  blueprintAssignment: {
    findUnique: stub().resolves({ blueprintCourseId })
  },
  blueprintAssignmentProblem: {
    findMany: stub().resolves([])
  }
})

describe('BlueprintAssignmentProblemService', () => {
  let service: BlueprintAssignmentProblemService
  let db: ReturnType<typeof createDb>
  let access: { assertBlueprintLeader: SinonStub }

  beforeEach(async () => {
    db = createDb()
    access = { assertBlueprintLeader: stub().resolves() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlueprintAssignmentProblemService,
        { provide: PrismaService, useValue: db },
        { provide: BlueprintAccessService, useValue: access }
      ]
    }).compile()

    service = module.get(BlueprintAssignmentProblemService)
  })

  describe('getBlueprintAssignmentProblems', () => {
    it('returns blueprint problems ordered by order', async () => {
      const problems = [bap(1, 0), bap(2, 1)]
      db.blueprintAssignmentProblem.findMany.resolves(problems)

      const result = await service.getBlueprintAssignmentProblems(
        user,
        blueprintAssignmentId
      )

      expect(result).to.deep.equal(problems)
      expect(
        db.blueprintAssignmentProblem.findMany.firstCall.args[0]
      ).to.deep.equal({
        where: { blueprintAssignmentId },
        orderBy: { order: 'asc' }
      })
    })

    it('throws EntityNotExistException when the blueprint assignment does not exist', async () => {
      db.blueprintAssignment.findUnique.resolves(null)

      await expect(
        service.getBlueprintAssignmentProblems(user, blueprintAssignmentId)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('calls assertBlueprintLeader with the parent blueprint course id', async () => {
      await service.getBlueprintAssignmentProblems(user, blueprintAssignmentId)

      expect(
        access.assertBlueprintLeader.calledOnceWith(user, blueprintCourseId)
      ).to.be.true
    })

    it('throws ForbiddenAccessException when the user is not a leader', async () => {
      access.assertBlueprintLeader.rejects(new ForbiddenAccessException('no'))

      await expect(
        service.getBlueprintAssignmentProblems(user, blueprintAssignmentId)
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(db.blueprintAssignmentProblem.findMany.called).to.be.false
    })
  })
})
