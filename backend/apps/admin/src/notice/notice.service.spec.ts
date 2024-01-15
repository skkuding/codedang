import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { Group, Notice } from '@admin/@generated'
import type { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'
import { NoticeService } from './notice.service'

const noticeId = 1
const userId = 1
const groupId = 1
const failGroupId = 1000

const notice: Notice = {
  id: noticeId,
  createdById: userId,
  groupId,
  title: 'title',
  content: 'content',
  isVisible: true,
  isFixed: true,
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}

const group: Group = {
  id: groupId,
  groupName: 'groupName',
  description: 'description',
  config: {
    showOnList: true,
    allowJoinFromSearch: true,
    allowJoinWithURL: false,
    requireApprovalBeforeJoin: true
  },
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}

const createNoticeInput: CreateNoticeInput = {
  title: 'title',
  content: 'content',
  isVisible: true,
  isFixed: true
}

const updateNoticeInput: UpdateNoticeInput = {
  id: noticeId,
  title: 'updated title',
  content: 'updated content',
  isVisible: false,
  isFixed: false
}

const failUpdateNoticeInput: UpdateNoticeInput = {
  ...updateNoticeInput,
  id: 1000
}

const updatedNotice = {
  ...updateNoticeInput,
  ...notice
}

const db = {
  notice: {
    findFirst: stub().resolves(notice),
    create: stub().resolves(notice),
    delete: stub().resolves(notice),
    update: stub().resolves(updatedNotice)
  },
  group: {
    findUnique: stub().resolves(group)
  }
}

describe('NoticeService', () => {
  let service: NoticeService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoticeService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get<NoticeService>(NoticeService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('createNotice', () => {
    it('should return created notice', async () => {
      expect(
        await service.createNotice(groupId, userId, createNoticeInput)
      ).to.deep.equal(notice)
    })

    it('should throw error when groupId not exist', async () => {
      expect(
        service.createNotice(failGroupId, userId, createNoticeInput)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('updateNotice', () => {
    it('should return updated contest', async () => {
      expect(
        await service.updateNotice(groupId, updateNoticeInput)
      ).to.deep.equal(updatedNotice)
    })

    it('should throw error when groupId not exist', async () => {
      expect(
        service.updateNotice(failGroupId, updateNoticeInput)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('deleteNotice', () => {
    it('should return deleted notice', async () => {
      expect(await service.deleteNotice(groupId, noticeId)).to.deep.equal(
        notice
      )
    })

    it('should throw error when groupId not exist', async () => {
      expect(
        service.updateNotice(failGroupId, updateNoticeInput)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw error when noticeId not exist', async () => {
      expect(
        service.updateNotice(groupId, failUpdateNoticeInput)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
