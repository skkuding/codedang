import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import * as sinon from 'sinon'
import { RolesService } from '@libs/auth'
import type { AuthenticatedRequest } from '@libs/auth'
import { CourseController, GroupController } from './group.controller'
import { CourseService, GroupService } from './group.service'

describe('GroupController', () => {
  let controller: GroupController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        { provide: GroupService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupController>(GroupController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('CourseController', () => {
  const joinGroupById = sinon.stub()
  let controller: CourseController

  beforeEach(async () => {
    joinGroupById.reset()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        { provide: GroupService, useValue: { joinGroupById } },
        { provide: CourseService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<CourseController>(CourseController)
  })

  it('should pass studentId to group service when joining a course', async () => {
    const request = { user: { id: 7 } } as AuthenticatedRequest
    joinGroupById.resolves({ userGroupData: {}, isJoined: true })

    await controller.joinCourseById(request, 2, '123456', {
      studentId: '2024000000'
    })

    expect(joinGroupById.calledOnceWithExactly(7, 2, '123456', '2024000000')).to
      .be.true
  })
})
