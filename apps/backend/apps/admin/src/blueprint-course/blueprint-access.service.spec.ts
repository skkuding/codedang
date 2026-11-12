import { Test, type TestingModule } from '@nestjs/testing'
import { Role } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { AuthenticatedUser } from '@libs/auth'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from './blueprint-access.service'

const blueprintCourseId = 10
const creatorId = 1

const creator = new AuthenticatedUser(creatorId, 'creator', Role.User)
const sectionLeader = new AuthenticatedUser(2, 'leader', Role.User)
const student = new AuthenticatedUser(3, 'student', Role.User)
const admin = new AuthenticatedUser(4, 'admin', Role.Admin)
const superAdmin = new AuthenticatedUser(5, 'superAdmin', Role.SuperAdmin)

const db = {
  user: {
    findUnique: stub()
  },
  blueprintCourse: {
    findUnique: stub()
  }
}

describe('BlueprintAccessService', () => {
  let service: BlueprintAccessService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlueprintAccessService,
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<BlueprintAccessService>(BlueprintAccessService)
  })

  afterEach(() => {
    db.user.findUnique.reset()
    db.blueprintCourse.findUnique.reset()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('assertCanCreateCourse', () => {
    it('should pass when user can create course', async () => {
      db.user.findUnique.resolves({ canCreateCourse: true })

      await expect(service.assertCanCreateCourse(creatorId)).to.be.fulfilled
    })

    it('should throw EntityNotExistException when user does not exist', async () => {
      db.user.findUnique.resolves(null)

      await expect(service.assertCanCreateCourse(creatorId)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should throw ForbiddenAccessException when user cannot create course', async () => {
      db.user.findUnique.resolves({ canCreateCourse: false })

      await expect(service.assertCanCreateCourse(creatorId)).to.be.rejectedWith(
        ForbiddenAccessException
      )
    })
  })

  describe('isBlueprintLeader', () => {
    it('should return true for blueprint creator even without sections', async () => {
      db.blueprintCourse.findUnique.resolves({
        createdById: creatorId,
        courseInfo: []
      })

      expect(await service.isBlueprintLeader(creator, blueprintCourseId)).to.be
        .true
    })

    it('should return true for leader of a section in the blueprint', async () => {
      db.blueprintCourse.findUnique.resolves({
        createdById: creatorId,
        courseInfo: [{ groupId: 100 }]
      })

      expect(await service.isBlueprintLeader(sectionLeader, blueprintCourseId))
        .to.be.true
    })

    it('should return true for admin and super admin', async () => {
      db.blueprintCourse.findUnique.resolves({
        createdById: creatorId,
        courseInfo: []
      })

      expect(await service.isBlueprintLeader(admin, blueprintCourseId)).to.be
        .true
      expect(await service.isBlueprintLeader(superAdmin, blueprintCourseId)).to
        .be.true
    })

    it('should return false for user who is neither creator nor section leader', async () => {
      db.blueprintCourse.findUnique.resolves({
        createdById: creatorId,
        courseInfo: []
      })

      expect(await service.isBlueprintLeader(student, blueprintCourseId)).to.be
        .false
    })

    it('should return false when creator was deleted and user has no section', async () => {
      db.blueprintCourse.findUnique.resolves({
        createdById: null,
        courseInfo: []
      })

      expect(await service.isBlueprintLeader(student, blueprintCourseId)).to.be
        .false
    })

    it('should look up only sections where the user is group leader', async () => {
      db.blueprintCourse.findUnique.resolves({
        createdById: creatorId,
        courseInfo: []
      })

      await service.isBlueprintLeader(sectionLeader, blueprintCourseId)

      const args = db.blueprintCourse.findUnique.firstCall.args[0]
      expect(args.where).to.deep.equal({ id: blueprintCourseId })
      expect(args.select.courseInfo.where).to.deep.equal({
        group: {
          userGroup: {
            some: { userId: sectionLeader.id, isGroupLeader: true }
          }
        }
      })
    })

    it('should throw EntityNotExistException when blueprint does not exist', async () => {
      db.blueprintCourse.findUnique.resolves(null)

      await expect(
        service.isBlueprintLeader(creator, blueprintCourseId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('assertBlueprintLeader', () => {
    it('should pass for blueprint leader', async () => {
      db.blueprintCourse.findUnique.resolves({
        createdById: creatorId,
        courseInfo: []
      })

      await expect(service.assertBlueprintLeader(creator, blueprintCourseId)).to
        .be.fulfilled
    })

    it('should throw ForbiddenAccessException for non leader', async () => {
      db.blueprintCourse.findUnique.resolves({
        createdById: creatorId,
        courseInfo: []
      })

      await expect(
        service.assertBlueprintLeader(student, blueprintCourseId)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should throw EntityNotExistException when blueprint does not exist', async () => {
      db.blueprintCourse.findUnique.resolves(null)

      await expect(
        service.assertBlueprintLeader(creator, blueprintCourseId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
