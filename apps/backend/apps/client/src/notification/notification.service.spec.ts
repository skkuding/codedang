import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import type {
  Notification,
  NotificationRecord,
  PushSubscription
} from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  EntityNotExistException,
  ConflictFoundException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { NotificationService } from './notification.service'

const userId = 1
const notificationRecordId = 1
const notificationId = 1

const notification: Notification = {
  id: notificationId,
  title: 'Assignment Graded',
  message: 'Your assignment "Math Problem Set 1" has been graded.',
  url: '/assignment/1',
  type: 'Assignment',
  createTime: faker.date.past()
}

const notificationRecord: NotificationRecord = {
  id: notificationRecordId,
  userId,
  notificationId,
  isRead: false,
  createTime: faker.date.past()
}

const pushSubscription: PushSubscription = {
  id: 1,
  userId,
  endpoint: 'https://fcm.googleapis.com/fcm/send/test',
  p256dh: 'test-p256dh-key',
  auth: 'test-auth-key',
  userAgent: 'Mozilla/5.0',
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}

const readNotificationRecord = {
  ...notificationRecord,
  isRead: true
}

const notificationRecordWithNotification = {
  ...notificationRecord,
  notification
}

const readNotificationRecordWithNotification = {
  ...readNotificationRecord,
  notification
}

const formattedNotification = {
  id: notificationRecord.id,
  notificationId: notification.id,
  title: notification.title,
  message: notification.message,
  url: notification.url,
  type: notification.type,
  isRead: notificationRecord.isRead,
  createTime: notificationRecord.createTime
}

const db = {
  notificationRecord: {
    findMany: stub(),
    update: stub(),
    updateMany: stub(),
    delete: stub(),
    count: stub()
  },
  notification: {
    delete: stub(),
    deleteMany: stub()
  },
  pushSubscription: {
    findMany: stub(),
    create: stub(),
    delete: stub(),
    deleteMany: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator
}

const mockConfigService = {
  get: stub()
}

const recordNotFoundPrismaError = new PrismaClientKnownRequestError(
  'Record to update not found.',
  {
    code: 'P2025',
    clientVersion: '5.8.1'
  }
)

const duplicateRecordPrismaError = new PrismaClientKnownRequestError(
  'Unique constraint failed.',
  {
    code: 'P2002',
    clientVersion: '5.8.1'
  }
)

describe('NotificationService', () => {
  let service: NotificationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: db },
        { provide: ConfigService, useValue: mockConfigService }
      ]
    }).compile()

    service = module.get<NotificationService>(NotificationService)
  })

  afterEach(() => {
    db.notificationRecord.findMany.reset()
    db.notificationRecord.update.reset()
    db.notificationRecord.updateMany.reset()
    db.notificationRecord.delete.reset()
    db.notificationRecord.count.reset()
    db.notification.delete.reset()
    db.notification.deleteMany.reset()
    db.pushSubscription.findMany.reset()
    db.pushSubscription.create.reset()
    db.pushSubscription.delete.reset()
    db.pushSubscription.deleteMany.reset()
    mockConfigService.get.reset()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getNotifications', () => {
    it('should return formatted notifications for user', async () => {
      db.notificationRecord.findMany.resolves([
        notificationRecordWithNotification
      ])

      const result = await service.getNotifications(userId, null, 8, null)

      expect(result).to.deep.equal([formattedNotification])
    })

    it('should return empty array when no notifications exist', async () => {
      db.notificationRecord.findMany.resolves([])

      const result = await service.getNotifications(userId, null, 8, null)

      expect(result).to.deep.equal([])
    })

    it('should filter by isRead when provided', async () => {
      db.notificationRecord.findMany.resolves([
        notificationRecordWithNotification
      ])

      const result = await service.getNotifications(userId, null, 8, false)

      expect(result).to.deep.equal([formattedNotification])
    })

    it('should return all notifications when isRead is null', async () => {
      db.notificationRecord.findMany.resolves([
        notificationRecordWithNotification
      ])

      const result = await service.getNotifications(userId, null, 8, null)

      expect(result).to.deep.equal([formattedNotification])
    })
  })

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      db.notificationRecord.count.resolves(5)

      const result = await service.getUnreadCount(userId)

      expect(result).to.equal(5)
    })

    it('should return zero when no unread notifications exist', async () => {
      db.notificationRecord.count.resolves(0)

      const result = await service.getUnreadCount(userId)

      expect(result).to.equal(0)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read and return updated record', async () => {
      db.notificationRecord.update.resolves(
        readNotificationRecordWithNotification
      )

      const result = await service.markAsRead(userId, notificationRecordId)

      expect(result).to.deep.equal(readNotificationRecordWithNotification)
    })

    it('should throw EntityNotExistException when notification record not found', async () => {
      db.notificationRecord.update.rejects(recordNotFoundPrismaError)

      await expect(
        service.markAsRead(userId, notificationRecordId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      const updateResult = { count: 3 }
      db.notificationRecord.updateMany.resolves(updateResult)

      const result = await service.markAllAsRead(userId)

      expect(result).to.deep.equal({ successCount: 3 })
    })

    it('should return zero count when no unread notifications exist', async () => {
      const updateResult = { count: 0 }
      db.notificationRecord.updateMany.resolves(updateResult)

      const result = await service.markAllAsRead(userId)

      expect(result).to.deep.equal({ successCount: 0 })
    })
  })

  describe('deleteNotification', () => {
    it('should delete notification record and return deleted record', async () => {
      db.notificationRecord.delete.resolves(notificationRecordWithNotification)
      db.notificationRecord.count.resolves(0)
      db.notification.deleteMany.resolves({ count: 1 })

      const result = await service.deleteNotification(
        userId,
        notificationRecordId
      )

      expect(result).to.deep.equal(notificationRecordWithNotification)
    })

    it('should throw EntityNotExistException when notification record not found', async () => {
      db.notificationRecord.delete.rejects(recordNotFoundPrismaError)

      await expect(
        service.deleteNotification(userId, notificationRecordId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('createPushSubscription', () => {
    const dto = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: { p256dh: 'test-p256dh-key', auth: 'test-auth-key' },
      userAgent: 'Mozilla/5.0'
    }

    it('should create push subscription successfully', async () => {
      db.pushSubscription.create.resolves(pushSubscription)

      const result = await service.createPushSubscription(userId, dto)

      expect(result).to.deep.equal(pushSubscription)
      expect(
        db.pushSubscription.create.calledWith({
          data: {
            userId,
            endpoint: dto.endpoint,
            p256dh: dto.keys.p256dh,
            auth: dto.keys.auth,
            userAgent: dto.userAgent
          }
        })
      ).to.be.true
    })

    it('should throw ConflictFoundException when subscription already exists', async () => {
      db.pushSubscription.create.rejects(duplicateRecordPrismaError)

      await expect(
        service.createPushSubscription(userId, dto)
      ).to.be.rejectedWith(ConflictFoundException)
    })
  })

  describe('deletePushSubscription', () => {
    const endpoint = 'https://fcm.googleapis.com/fcm/send/test'

    it('should delete specific push subscription', async () => {
      db.pushSubscription.delete.resolves(pushSubscription)

      const result = await service.deletePushSubscription(userId, endpoint)

      expect(result).to.deep.equal({
        deletedCount: 1,
        subscription: pushSubscription
      })
      expect(
        db.pushSubscription.delete.calledWith({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            userId_endpoint: { userId, endpoint }
          }
        })
      ).to.be.true
    })

    it('should delete all push subscriptions when endpoint not provided', async () => {
      db.pushSubscription.deleteMany.resolves({ count: 3 })

      const result = await service.deletePushSubscription(userId)

      expect(result).to.deep.equal({ deletedCount: 3 })
      expect(
        db.pushSubscription.deleteMany.calledWith({
          where: { userId }
        })
      ).to.be.true
    })

    it('should throw EntityNotExistException when subscription not found', async () => {
      db.pushSubscription.delete.rejects(recordNotFoundPrismaError)

      await expect(
        service.deletePushSubscription(userId, endpoint)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('getPushSubscriptions', () => {
    it("should return user's push subscriptions with selected fields", async () => {
      const selected = {
        id: pushSubscription.id,
        userId: pushSubscription.userId,
        endpoint: pushSubscription.endpoint,
        userAgent: pushSubscription.userAgent,
        createTime: pushSubscription.createTime
      }
      db.pushSubscription.findMany.resolves([selected])

      const result = await service.getPushSubscriptions(userId)

      expect(result).to.deep.equal([selected])
      expect(
        db.pushSubscription.findMany.calledWith({
          where: { userId },
          select: {
            id: true,
            userId: true,
            endpoint: true,
            userAgent: true,
            createTime: true
          }
        })
      ).to.be.true
    })

    it('should return empty array when no subscriptions exist', async () => {
      db.pushSubscription.findMany.resolves([])

      const result = await service.getPushSubscriptions(userId)

      expect(result).to.deep.equal([])
    })
  })

  describe('getVapidPublicKey', () => {
    it('should return VAPID public key', () => {
      const publicKey = 'test-vapid-public-key'
      mockConfigService.get.withArgs('VAPID_PUBLIC_KEY').returns(publicKey)

      const result = service.getVapidPublicKey()

      expect(result).to.deep.equal({ publicKey })
    })

    it('should throw error when VAPID public key not configured', () => {
      mockConfigService.get.withArgs('VAPID_PUBLIC_KEY').returns(undefined)

      expect(() => service.getVapidPublicKey()).to.throw(
        'VAPID_PUBLIC_KEY is not configured'
      )
    })
  })
})
