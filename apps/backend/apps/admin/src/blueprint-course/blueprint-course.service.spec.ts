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
    create: stub()
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
  })

  it('should be defined', () => {
    expect(service).to.be.ok
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
