import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import type { Assignment, Notification } from '@prisma/client'
import { NotificationType } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { AssignmentService } from '@admin/assignment/assignment.service'
import { NotificationService } from './notification.service'

const assignmentId = 1
const userId = 1
const groupId = 1
const notificationId = 1

const assignment: Assignment = {
  id: assignmentId,
  createdById: userId,
  groupId,
  title: 'Math Problem Set 1',
  description: 'Assignment description',
  startTime: faker.date.past(),
  endTime: faker.date.future(),
  dueTime: faker.date.future(),
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  week: 1,
  autoFinalizeScore: false,
  isFinalScoreVisible: false,
  isExercise: false
}

const assignmentInfo = {
  title: assignment.title,
  group: {
    id: groupId,
    groupName: 'Test Group',
    userGroup: [{ userId: 1 }, { userId: 2 }, { userId: 3 }]
  }
}

const assignmentInfoForGraded = {
  title: assignment.title,
  group: {
    id: groupId,
    groupName: 'Test Group'
  },
  assignmentRecord: [{ userId: 1 }, { userId: 2 }]
}

const notification: Notification = {
  id: notificationId,
  title: 'Test Group',
  message: `A new assignment "${assignment.title}" has been created.`,
  url: null,
  type: NotificationType.Assignment,
  createTime: faker.date.past()
}

const db = {
  assignment: {
    findUnique: stub()
  },
  notification: {
    create: stub()
  },
  notificationRecord: {
    createMany: stub()
  },
  pushSubscription: {
    findMany: stub(),
    delete: stub()
  }
}

const assignmentService = {
  isAllAssignmentProblemGraded: stub()
}

const mockConfigService = {
  get: stub()
}

describe('NotificationService', () => {
  let service: NotificationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: db },
        { provide: AssignmentService, useValue: assignmentService },
        { provide: ConfigService, useValue: mockConfigService }
      ]
    }).compile()

    service = module.get<NotificationService>(NotificationService)
  })

  afterEach(() => {
    db.assignment.findUnique.reset()
    db.notification.create.reset()
    db.notificationRecord.createMany.reset()
    db.pushSubscription.findMany.reset()
    db.pushSubscription.delete.reset()
    assignmentService.isAllAssignmentProblemGraded.reset()
    mockConfigService.get.reset()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('notifyAssignmentGraded', () => {
    it('should create notification for all graded users', async () => {
      db.assignment.findUnique.resolves(assignmentInfoForGraded)
      db.notification.create.resolves(notification)
      db.notificationRecord.createMany.resolves({ count: 2 })
      db.pushSubscription.findMany.resolves([])

      await service.notifyAssignmentGraded(assignmentId)

      expect(
        db.assignment.findUnique.calledWith({
          where: { id: assignmentId },
          select: {
            title: true,
            group: { select: { id: true, groupName: true } },
            assignmentRecord: {
              where: { userId: { not: null } },
              select: { userId: true }
            }
          }
        })
      ).to.be.true
      expect(db.notification.create.calledOnce).to.be.true
      expect(db.notificationRecord.createMany.calledOnce).to.be.true
      const createManyCall = db.notificationRecord.createMany.getCall(0)
      expect(createManyCall.args[0].data).to.have.lengthOf(2)
    })

    it('should not create notification when no receivers found', async () => {
      db.assignment.findUnique.resolves({
        title: assignment.title,
        group: { id: groupId, groupName: 'Test Group' },
        assignmentRecord: []
      })

      await service.notifyAssignmentGraded(assignmentId)

      expect(db.assignment.findUnique.calledOnce).to.be.true
      expect(db.notification.create.called).to.be.false
      expect(db.notificationRecord.createMany.called).to.be.false
    })

    it('should handle missing assignment info gracefully', async () => {
      db.assignment.findUnique.resolves(null)

      await service.notifyAssignmentGraded(assignmentId)

      expect(db.assignment.findUnique.calledOnce).to.be.true
      expect(db.notification.create.called).to.be.false
      expect(db.notificationRecord.createMany.called).to.be.false
    })
  })

  describe('notifyAssignmentCreated', () => {
    it('should create notification for all group members when assignment is created', async () => {
      db.assignment.findUnique.resolves(assignmentInfo)
      db.notification.create.resolves(notification)
      db.notificationRecord.createMany.resolves({ count: 3 })
      db.pushSubscription.findMany.resolves([])

      await service.notifyAssignmentCreated(assignmentId)

      expect(
        db.assignment.findUnique.calledWith({
          where: { id: assignmentId },
          select: {
            title: true,
            group: {
              select: {
                id: true,
                groupName: true,
                userGroup: { select: { userId: true } }
              }
            }
          }
        })
      ).to.be.true

      expect(db.notification.create.calledOnce).to.be.true
      const createCall = db.notification.create.getCall(0)
      expect(createCall.args[0].data.title).to.equal('Test Group')
      expect(createCall.args[0].data.message).to.equal(
        `A new assignment "${assignment.title}" has been created.`
      )
      expect(createCall.args[0].data.type).to.equal(NotificationType.Assignment)

      expect(db.notificationRecord.createMany.calledOnce).to.be.true
      const createManyCall = db.notificationRecord.createMany.getCall(0)
      expect(createManyCall.args[0].data).to.have.lengthOf(3)
      expect(createManyCall.args[0].data[0]).to.deep.include({
        notificationId: notification.id,
        userId: 1
      })
    })

    it('should handle assignment with no group members', async () => {
      const assignmentInfoEmpty = {
        title: assignment.title,
        group: {
          id: groupId,
          groupName: 'Test Group',
          userGroup: []
        }
      }

      db.assignment.findUnique.resolves(assignmentInfoEmpty)

      await service.notifyAssignmentCreated(assignmentId)

      expect(db.assignment.findUnique.calledOnce).to.be.true
      expect(db.notification.create.called).to.be.false
      expect(db.notificationRecord.createMany.called).to.be.false
    })

    it('should handle missing assignment info gracefully', async () => {
      db.assignment.findUnique.resolves(null)

      await service.notifyAssignmentCreated(assignmentId)

      expect(db.assignment.findUnique.calledOnce).to.be.true
      expect(db.notification.create.called).to.be.false
      expect(db.notificationRecord.createMany.called).to.be.false
    })
  })

  describe('saveNotification (private method test through public methods)', () => {
    it('should not create notification when receivers list is empty', async () => {
      const assignmentInfoEmpty = {
        title: assignment.title,
        group: {
          groupName: 'Test Group',
          userGroup: []
        }
      }

      db.assignment.findUnique.resolves(assignmentInfoEmpty)

      await service.notifyAssignmentCreated(assignmentId)

      expect(db.notification.create.called).to.be.false
      expect(db.notificationRecord.createMany.called).to.be.false
    })
  })

  describe('sendPushNotification', () => {
    it('should call findMany when notifying assignment graded', async () => {
      db.assignment.findUnique.resolves(assignmentInfoForGraded)
      db.notification.create.resolves(notification)
      db.notificationRecord.createMany.resolves({ count: 2 })
      db.pushSubscription.findMany.resolves([])

      await service.notifyAssignmentGraded(assignmentId)

      expect(db.pushSubscription.findMany.calledOnce).to.be.true
    })

    it('should call findMany when notifying assignment created', async () => {
      db.assignment.findUnique.resolves(assignmentInfo)
      db.notification.create.resolves(notification)
      db.notificationRecord.createMany.resolves({ count: 3 })
      db.pushSubscription.findMany.resolves([])

      await service.notifyAssignmentCreated(assignmentId)

      expect(db.pushSubscription.findMany.calledOnce).to.be.true
    })
  })
})
