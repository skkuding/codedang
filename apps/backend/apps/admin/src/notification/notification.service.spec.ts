import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import type { Assignment, Notification } from '@prisma/client'
import { NotificationType } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import * as webpush from 'web-push'
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
    groupName: 'Test Group',
    userGroup: [{ userId: 1 }, { userId: 2 }]
  }
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
  contest: {
    findUnique: stub()
  },
  notice: {
    findUnique: stub()
  },
  user: {
    findMany: stub()
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
    db.contest.findUnique.reset()
    db.notice.findUnique.reset()
    db.user.findMany.reset()
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
      db.pushSubscription.findMany.resolves([])

      await service.notifyAssignmentGraded(assignmentId)

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
      const inputData = createCall.args[0].data

      expect(inputData.NotificationRecord.createMany.data).to.have.lengthOf(2)
    })

    it('should not create notification when no receivers found', async () => {
      db.assignment.findUnique.resolves({
        title: assignment.title,
        group: { id: groupId, groupName: 'Test Group', userGroup: [] }
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
      const inputData = createCall.args[0].data
      expect(createCall.args[0].data.title).to.equal('Test Group')
      expect(createCall.args[0].data.message).to.equal(
        `A new assignment "${assignment.title}" has been created.`
      )
      expect(createCall.args[0].data.type).to.equal(NotificationType.Assignment)

      expect(inputData.NotificationRecord.createMany.data).to.have.lengthOf(3)
      expect(inputData.NotificationRecord.createMany.data).to.deep.include({
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
          id: groupId,
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

  describe('notifyAssignmentDue', () => {
    it('should create notification with timing 1 day when dueTime is far', async () => {
      const dueTime = new Date(Date.now() + 25 * 60 * 60 * 1000)
      db.assignment.findUnique.resolves({
        title: assignment.title,
        dueTime,
        group: {
          id: groupId,
          groupName: 'Test Group',
          userGroup: [{ userId: 1 }, { userId: 2 }]
        }
      })
      db.notification.create.resolves(notification)
      db.notificationRecord.createMany.resolves({ count: 2 })
      db.pushSubscription.findMany.resolves([])

      await service.notifyAssignmentDue(assignmentId)

      expect(db.notification.create.calledOnce).to.be.true
      const createCall = db.notification.create.getCall(0)
      expect(createCall.args[0].data.message).to.include('due in 1 day')
      expect(createCall.args[0].data.type).to.equal(NotificationType.Assignment)
    })

    it('should create notification with timing 3 hours when dueTime is near', async () => {
      const dueTime = new Date(Date.now() + 2 * 60 * 60 * 1000)
      db.assignment.findUnique.resolves({
        title: assignment.title,
        dueTime,
        group: {
          id: groupId,
          groupName: 'Test Group',
          userGroup: [{ userId: 1 }]
        }
      })
      db.notification.create.resolves(notification)
      db.notificationRecord.createMany.resolves({ count: 1 })
      db.pushSubscription.findMany.resolves([])

      await service.notifyAssignmentDue(assignmentId)

      const createCall = db.notification.create.getCall(0)
      expect(createCall.args[0].data.message).to.include('due in 3 hours')
    })

    it('should handle missing assignment info gracefully', async () => {
      db.assignment.findUnique.resolves(null)
      await service.notifyAssignmentDue(assignmentId)
      expect(db.notification.create.called).to.be.false
      expect(db.notificationRecord.createMany.called).to.be.false
    })
  })

  describe('notifyContestStartingSoon', () => {
    it('should notify only participants and use contest type', async () => {
      db.notification.create.resolves({
        ...notification,
        message: 'x',
        type: NotificationType.Contest
      })
      db.notificationRecord.createMany.resolves({ count: 1 })
      db.pushSubscription.findMany.resolves([])

      db.contest.findUnique.resolves({
        title: 'Contest Title',
        userContest: [{ userId: 42 }, { userId: null }]
      })

      await service.notifyContestStartingSoon(99)

      expect(db.contest.findUnique.calledOnce).to.be.true
      const createCall = db.notification.create.getCall(0)
      expect(createCall.args[0].data.type).to.equal(NotificationType.Contest)
      expect(db.pushSubscription.findMany.calledOnce).to.be.true
    })
  })

  describe('sendPushNotification deletion on 410', () => {
    it('should delete expired subscription when webpush returns 410', async () => {
      const sendStub = stub(webpush, 'sendNotification').rejects({
        statusCode: 410
      })

      db.pushSubscription.findMany.resolves([
        {
          id: 99,
          userId: 1,
          endpoint: 'https://example.com/ep',
          p256dh: 'p',
          auth: 'a'
        }
      ])

      db.assignment.findUnique.resolves(assignmentInfo)
      db.notification.create.resolves(notification)
      db.notificationRecord.createMany.resolves({ count: 3 })

      await service.notifyAssignmentCreated(assignmentId)

      expect(db.pushSubscription.delete.calledOnce).to.be.true
      const delCall = db.pushSubscription.delete.getCall(0)
      expect(delCall.args[0]).to.deep.equal({ where: { id: 99 } })

      sendStub.restore()
    })
  })

  describe('notifyNoticeCreated', () => {
    it('should notify all users with the notice title and type Other', async () => {
      const noticeId = 55
      db.notice.findUnique.resolves({
        title: 'Important Update',
        content: 'Body content here'
      })
      db.user.findMany.resolves([{ id: 1 }, { id: 2 }, { id: 3 }])
      db.notification.create.resolves(notification)
      db.notificationRecord.createMany.resolves({ count: 3 })
      db.pushSubscription.findMany.resolves([])

      await service.notifyNoticeCreated(noticeId)

      expect(
        db.notice.findUnique.calledWith({
          where: { id: noticeId },
          select: { title: true, content: true }
        })
      ).to.be.true
      expect(db.user.findMany.calledOnce).to.be.true

      expect(db.notification.create.calledOnce).to.be.true
      const createCall = db.notification.create.getCall(0)
      expect(createCall.args[0].data.title).to.equal('Important Update')
      expect(createCall.args[0].data.message).to.equal('Body content here')
      expect(createCall.args[0].data.type).to.equal(NotificationType.Other)
      expect(createCall.args[0].data.url).to.equal(`/notice/${noticeId}`)

      expect(db.notificationRecord.createMany.calledOnce).to.be.true
      const createManyCall = db.notificationRecord.createMany.getCall(0)
      expect(createManyCall.args[0].data).to.have.lengthOf(3)
      expect(db.pushSubscription.findMany.calledOnce).to.be.true
    })

    it('should handle missing notice info gracefully', async () => {
      const noticeId = 77
      db.notice.findUnique.resolves(null)

      await service.notifyNoticeCreated(noticeId)

      expect(db.user.findMany.called).to.be.false
      expect(db.notification.create.called).to.be.false
      expect(db.notificationRecord.createMany.called).to.be.false
      expect(db.pushSubscription.findMany.called).to.be.false
    })
  })
})
