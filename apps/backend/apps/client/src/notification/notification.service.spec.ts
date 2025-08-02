import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import type { Notification, NotificationRecord } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EntityNotExistException } from '@libs/exception'
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
  getPaginator: PrismaService.prototype.getPaginator
}

const recordNotFoundPrismaError = new PrismaClientKnownRequestError(
  'Record to update not found.',
  {
    code: 'P2025',
    clientVersion: '5.8.1'
  }
)

describe('NotificationService', () => {
  let service: NotificationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService, { provide: PrismaService, useValue: db }]
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
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getNotifications', () => {
    it('should return formatted notifications for user', async () => {
      db.notificationRecord.findMany.resolves([
        notificationRecordWithNotification
      ])

      const result = await service.getNotifications(userId, null, 8)

      expect(result).to.deep.equal([formattedNotification])
    })

    it('should return empty array when no notifications exist', async () => {
      db.notificationRecord.findMany.resolves([])

      const result = await service.getNotifications(userId, null, 8)

      expect(result).to.deep.equal([])
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
})
