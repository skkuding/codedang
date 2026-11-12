import { Test, type TestingModule } from '@nestjs/testing'
import { Role } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { AuthenticatedUser, type AuthenticatedRequest } from '@libs/auth'
import { BlueprintCourseResolver } from './blueprint-course.resolver'
import { BlueprintCourseService } from './blueprint-course.service'
import type { BlueprintCourseInput } from './model/blueprint-course.input'

const user = new AuthenticatedUser(1, 'professor', Role.User)
const req = { user } as AuthenticatedRequest

const input: BlueprintCourseInput = {
  courseTitle: '소프트웨어공학개론',
  courseNum: 'SWE3002',
  semester: '2026 Fall',
  week: 16,
  professor: '김교수'
}

const createdBlueprintCourse = {
  id: 1,
  ...input,
  createdById: user.id
}

const blueprintCourseService = {
  createBlueprintCourse: stub()
}

describe('BlueprintCourseResolver', () => {
  let resolver: BlueprintCourseResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlueprintCourseResolver,
        { provide: BlueprintCourseService, useValue: blueprintCourseService }
      ]
    }).compile()

    resolver = module.get<BlueprintCourseResolver>(BlueprintCourseResolver)
  })

  afterEach(() => {
    blueprintCourseService.createBlueprintCourse.reset()
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })

  describe('createBlueprintCourse', () => {
    it('should call service with input and request user', async () => {
      blueprintCourseService.createBlueprintCourse.resolves(
        createdBlueprintCourse
      )

      await resolver.createBlueprintCourse(req, input)

      expect(blueprintCourseService.createBlueprintCourse.calledOnce).to.be.true
      expect(
        blueprintCourseService.createBlueprintCourse.calledOnceWithExactly(
          input,
          user
        )
      ).to.be.true
    })

    it('should return the result of service as is', async () => {
      blueprintCourseService.createBlueprintCourse.resolves(
        createdBlueprintCourse
      )

      const res = await resolver.createBlueprintCourse(req, input)

      expect(res).to.equal(createdBlueprintCourse)
    })
  })
})
