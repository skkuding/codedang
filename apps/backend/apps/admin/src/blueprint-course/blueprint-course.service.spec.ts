import { Test, type TestingModule } from '@nestjs/testing'
import { Role } from '@prisma/client'
import { expect } from 'chai'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { stub } from 'sinon'
import { AuthenticatedUser } from '@libs/auth'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from './blueprint-access.service'
import { BlueprintCourseService } from './blueprint-course.service'
import { BlueprintCourseInput } from './model/blueprint-course.input'

const userId = 1
const user = new AuthenticatedUser(userId, 'professor', Role.User)

const input: BlueprintCourseInput = {
  courseTitle: '소프트웨어공학개론',
  courseNum: 'SWE3002',
  semester: '2026 Fall',
  week: 16,
  professor: '김교수',
  email: 'professor@skku.edu',
  website: 'https://skku.edu',
  office: '26310',
  phoneNum: '031-290-0000'
}

const createdBlueprintCourse = {
  id: 1,
  ...input,
  createdById: userId,
  createTime: new Date(),
  updateTime: new Date()
}

const db = {
  user: {
    findUnique: stub()
  },
  blueprintCourse: {
    create: stub(),
    findMany: stub(),
    findUnique: stub()
  }
}

describe('BlueprintCourseService', () => {
  let service: BlueprintCourseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlueprintCourseService,
        BlueprintAccessService,
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<BlueprintCourseService>(BlueprintCourseService)
  })

  afterEach(() => {
    db.user.findUnique.reset()
    db.blueprintCourse.create.reset()
    db.blueprintCourse.findMany.reset()
    db.blueprintCourse.findUnique.reset()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getBlueprintCourse', () => {
    const blueprintCourseId = 1
    const details = { ...createdBlueprintCourse, courseInfo: [] }

    for (const scenario of [
      {
        name: 'creator without sections',
        role: Role.User,
        owner: userId,
        sections: []
      },
      {
        name: 'section leader',
        role: Role.User,
        owner: 99,
        sections: [{ groupId: 101 }]
      },
      {
        name: 'Admin without membership',
        role: Role.Admin,
        owner: 99,
        sections: []
      },
      {
        name: 'SuperAdmin without membership',
        role: Role.SuperAdmin,
        owner: 99,
        sections: []
      },
      {
        name: 'section leader after owner deletion',
        role: Role.User,
        owner: null,
        sections: [{ groupId: 101 }]
      }
    ]) {
      it(`should allow the ${scenario.name}`, async () => {
        const requester = new AuthenticatedUser(
          userId,
          'requester',
          scenario.role
        )
        db.blueprintCourse.findUnique.onFirstCall().resolves({
          createdById: scenario.owner,
          courseInfo: scenario.sections
        })
        db.blueprintCourse.findUnique.onSecondCall().resolves(details)
        expect(
          await service.getBlueprintCourse(blueprintCourseId, requester)
        ).to.deep.equal({ ...createdBlueprintCourse, sections: [] })
        expect(db.blueprintCourse.findUnique.calledTwice).to.be.true
        for (const call of db.blueprintCourse.findUnique.getCalls()) {
          expect(call.args[0].where).to.deep.equal({ id: blueprintCourseId })
        }
      })
    }

    it('should reject an unrelated user before loading details', async () => {
      db.blueprintCourse.findUnique.resolves({
        createdById: 99,
        courseInfo: []
      })
      await expect(
        service.getBlueprintCourse(blueprintCourseId, user)
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(db.blueprintCourse.findUnique.calledOnce).to.be.true
    })

    for (const role of [Role.User, Role.Admin, Role.SuperAdmin]) {
      it(`should report a missing course for ${role}`, async () => {
        db.blueprintCourse.findUnique.resolves(null)
        await expect(
          service.getBlueprintCourse(
            blueprintCourseId,
            new AuthenticatedUser(userId, 'requester', role)
          )
        ).to.be.rejectedWith(EntityNotExistException)
        expect(db.blueprintCourse.findUnique.calledOnce).to.be.true
      })
    }

    it('should report deletion between authorization and detail lookup', async () => {
      db.blueprintCourse.findUnique
        .onFirstCall()
        .resolves({ createdById: userId, courseInfo: [] })
      db.blueprintCourse.findUnique.onSecondCall().resolves(null)
      await expect(
        service.getBlueprintCourse(blueprintCourseId, user)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should return all sections even when access comes from only one section', async () => {
      db.blueprintCourse.findUnique.onFirstCall().resolves({
        createdById: 99,
        courseInfo: [{ groupId: 101 }]
      })
      const groups = [101, 102].map((id, index) => ({
        id,
        groupName: `Section ${id}`,
        config: { showOnList: true },
        courseInfo: { classNum: index + 1 },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: { userGroup: index * 3 }
      }))
      db.blueprintCourse.findUnique.onSecondCall().resolves({
        ...createdBlueprintCourse,
        email: null,
        courseInfo: groups.map((group) => ({ group }))
      })
      const result = await service.getBlueprintCourse(blueprintCourseId, user)
      expect(result).to.deep.equal({
        ...createdBlueprintCourse,
        email: null,
        sections: groups.map((group) => ({
          ...group,
          memberNum: group._count.userGroup
        }))
      })
      const relation =
        db.blueprintCourse.findUnique.secondCall.args[0].include.courseInfo
      expect(relation).to.not.have.property('where')
      expect(relation.orderBy).to.deep.equal({ classNum: 'asc' })
      expect(db.blueprintCourse.findUnique.calledTwice).to.be.true
    })

    it('should propagate detail lookup errors', async () => {
      db.blueprintCourse.findUnique
        .onFirstCall()
        .resolves({ createdById: userId, courseInfo: [] })
      db.blueprintCourse.findUnique
        .onSecondCall()
        .rejects(new Error('Database unavailable'))
      await expect(
        service.getBlueprintCourse(blueprintCourseId, user)
      ).to.be.rejectedWith('Database unavailable')
    })
  })

  describe('getBlueprintCourses', () => {
    const summary = {
      id: 1,
      courseTitle: input.courseTitle,
      courseNum: input.courseNum,
      semester: input.semester
    }

    it('should return an empty list when no courses match', async () => {
      db.blueprintCourse.findMany.resolves([])
      expect(await service.getBlueprintCourses(userId)).to.deep.equal([])
    })

    it('should preserve courses without sections', async () => {
      db.blueprintCourse.findMany.resolves([{ ...summary, courseInfo: [] }])
      expect(await service.getBlueprintCourses(userId)).to.deep.equal([
        { ...summary, sections: [] }
      ])
    })

    for (const role of [Role.User, Role.Admin, Role.SuperAdmin]) {
      it(`should restrict the list to created or led courses for ${role}`, async () => {
        const requester = new AuthenticatedUser(42, 'requester', role)
        db.blueprintCourse.findMany.resolves([])
        await service.getBlueprintCourses(requester.id)
        const query = db.blueprintCourse.findMany.firstCall.args[0]
        expect(query.where).to.deep.equal({
          OR: [
            { createdById: 42 },
            {
              courseInfo: {
                some: {
                  group: {
                    userGroup: {
                      some: { userId: 42, isGroupLeader: true }
                    }
                  }
                }
              }
            }
          ]
        })
        // Restrict courses, but do not filter their returned sections.
        expect(query.select.courseInfo).to.not.have.property('where')
        expect(query.orderBy).to.deep.equal({ id: 'desc' })
        expect(query.select.courseInfo.orderBy).to.deep.equal({
          classNum: 'asc'
        })
      })
    }

    it('should map every section and its member count without per-section queries', async () => {
      const groups = [3, 0].map((count, index) => ({
        id: 101 + index,
        groupName: `Section ${41 + index}`,
        config: { showOnList: true },
        courseInfo: { classNum: 41 + index },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: { userGroup: count }
      }))
      db.blueprintCourse.findMany.resolves([
        { ...summary, courseInfo: groups.map((group) => ({ group })) },
        { ...summary, id: 2, courseInfo: [] }
      ])
      const result = await service.getBlueprintCourses(userId)
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.include(summary)
      expect(result[0]).to.not.have.property('courseInfo')
      expect(result[0].sections.map((section) => section.id)).to.deep.equal([
        101, 102
      ])
      expect(
        result[0].sections.map((section) => section.memberNum)
      ).to.deep.equal([3, 0])
      expect(result[0].sections[0].config).to.deep.equal({ showOnList: true })
      expect(result[0].sections[0].courseInfo).to.deep.equal({ classNum: 41 })
      expect(result[1].sections).to.deep.equal([])
      expect(db.blueprintCourse.findMany.calledOnce).to.be.true
      expect(db.user.findUnique.called).to.be.false
    })

    it('should propagate database errors instead of returning an empty list', async () => {
      db.blueprintCourse.findMany.rejects(new Error('Database unavailable'))
      await expect(service.getBlueprintCourses(userId)).to.be.rejectedWith(
        'Database unavailable'
      )
    })
  })

  describe('createBlueprintCourse', () => {
    it('should create blueprint course with requester as creator', async () => {
      db.user.findUnique.resolves({ canCreateCourse: true })
      db.blueprintCourse.create.resolves(createdBlueprintCourse)

      const res = await service.createBlueprintCourse(input, user)

      expect(res).to.deep.equal(createdBlueprintCourse)
      expect(db.blueprintCourse.create.calledOnce).to.be.true
      expect(db.blueprintCourse.create.firstCall.args[0]).to.deep.equal({
        data: { ...input, createdById: userId }
      })
    })

    it('should throw ForbiddenAccessException and not create when user cannot create course', async () => {
      db.user.findUnique.resolves({ canCreateCourse: false })

      await expect(
        service.createBlueprintCourse(input, user)
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(db.blueprintCourse.create.called).to.be.false
    })

    it('should throw EntityNotExistException and not create when user does not exist', async () => {
      db.user.findUnique.resolves(null)

      await expect(
        service.createBlueprintCourse(input, user)
      ).to.be.rejectedWith(EntityNotExistException)
      expect(db.blueprintCourse.create.called).to.be.false
    })
  })
})

describe('BlueprintCourseInput', () => {
  const validateInput = (value: object) =>
    validate(plainToInstance(BlueprintCourseInput, value))

  it('should pass with required fields only', async () => {
    const required = {
      courseTitle: input.courseTitle,
      courseNum: input.courseNum,
      semester: input.semester,
      week: input.week,
      professor: input.professor
    }

    expect(await validateInput(required)).to.be.empty
  })

  it('should pass with all fields', async () => {
    expect(await validateInput(input)).to.be.empty
  })

  for (const field of [
    'courseTitle',
    'courseNum',
    'semester',
    'professor'
  ] as const) {
    it(`should fail when ${field} is empty`, async () => {
      const errors = await validateInput({ ...input, [field]: '' })

      expect(errors.map((error) => error.property)).to.deep.equal([field])
    })

    for (const blank of ['   ', '\t', '\n ']) {
      it(`should fail when ${field} is blank (${JSON.stringify(blank)})`, async () => {
        const errors = await validateInput({ ...input, [field]: blank })

        expect(errors.map((error) => error.property)).to.deep.equal([field])
        expect(errors[0].constraints).to.have.property('matches')
      })
    }

    it(`should pass and keep value when ${field} has surrounding spaces`, async () => {
      const value = `  ${input[field]}  `
      const instance = plainToInstance(BlueprintCourseInput, {
        ...input,
        [field]: value
      })

      expect(await validate(instance)).to.be.empty
      expect(instance[field]).to.equal(value)
    })
  }

  it('should fail when week is less than 1', async () => {
    const errors = await validateInput({ ...input, week: 0 })

    expect(errors.map((error) => error.property)).to.deep.equal(['week'])
  })

  it('should fail when week is not an integer', async () => {
    const errors = await validateInput({ ...input, week: 1.5 })

    expect(errors.map((error) => error.property)).to.deep.equal(['week'])
  })
})
