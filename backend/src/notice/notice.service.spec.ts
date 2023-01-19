import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from 'src/prisma/prisma.service'
import { Group, Notice } from '@prisma/client'
import { NoticeService } from './notice.service'
import { CreateNoticeDto } from './dto/create-notice.dto'
import { UpdateNoticeDto } from './dto/update-notice.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { GroupService } from 'src/group/group.service'

const noticeId = 2
const userId = 1
const groupId = 1

const createNoticeDto: CreateNoticeDto = {
  title: 'Title',
  content: 'Content',
  visible: true,
  fixed: true
}

const updateNoticeDto: UpdateNoticeDto = {
  title: 'Title',
  content: 'Content',
  visible: true,
  fixed: true
}

const notice: Notice = {
  id: noticeId,
  createdById: userId,
  groupId: groupId,
  title: 'Title',
  content: 'Content',
  visible: true,
  fixed: true,
  createTime: new Date(),
  updateTime: new Date()
}

const noticePrev: Notice = {
  ...notice,
  id: 1
}

const noticeNext: Notice = {
  ...notice,
  id: 3
}

const group: Group = {
  id: groupId,
  createdById: 1,
  groupName: 'group_name',
  private: true,
  invitationCode: '1',
  description: 'description',
  createTime: new Date(),
  updateTime: new Date()
}

const db = {
  notice: {
    findMany: stub(),
    findUnique: stub().resolves(notice),
    findFirst: stub(),
    create: stub().resolves(notice),
    update: stub().resolves(notice),
    delete: stub()
  },
  group: {
    findUnique: stub().resolves(group)
  },
  userGroup: {
    findMany: stub().resolves([groupId])
  }
}

describe('NoticeService', () => {
  let service: NoticeService
  let groupService: GroupService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeService,
        GroupService,
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<NoticeService>(NoticeService)
    groupService = module.get<GroupService>(GroupService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('createNotice', () => {
    beforeEach(() => {
      db.group.findUnique.resolves(group)
    })

    it('should return new created notice data', async () => {
      const createResult = await service.createNotice(
        userId,
        groupId,
        createNoticeDto
      )
      expect(createResult).to.deep.equal(notice)
    })

    it('should throw error when given group does not exist', async () => {
      db.group.findUnique.rejects(new EntityNotExistException('group'))
      await expect(
        service.createNotice(userId, groupId, createNoticeDto)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('getNoticesByGroupId', () => {
    const noticeArray = [
      {
        id: noticePrev.id,
        title: noticePrev.title,
        createTime: noticePrev.createTime,
        fixed: noticePrev.fixed
      },
      {
        id: notice.id,
        title: notice.title,
        createTime: notice.createTime,
        fixed: notice.fixed
      },
      {
        id: noticeNext.id,
        title: noticeNext.title,
        createTime: noticeNext.createTime,
        fixed: noticeNext.fixed
      }
    ]

    it('should return notice list of the group', async () => {
      db.notice.findMany.resolves(noticeArray)

      const getNoticesByGroupId = await service.getNoticesByGroupId(group.id, 1)
      expect(getNoticesByGroupId).to.deep.equal(noticeArray)
    })
  })

  describe('getNotice', () => {
    const userNotice = {
      current: {
        title: notice.title,
        content: notice.content,
        createTime: notice.createTime,
        updateTime: notice.updateTime
      },
      prev: {
        id: noticePrev.id,
        title: noticePrev.title
      },
      next: {
        id: noticeNext.id,
        title: noticeNext.title
      }
    }

    it('should return a notice and previews', async () => {
      db.notice.findFirst
        .onFirstCall()
        .resolves(userNotice.current)
        .onSecondCall()
        .resolves(userNotice.prev)
        .onThirdCall()
        .resolves(userNotice.next)

      const getNotice = await service.getNotice(noticeId, group.id)
      expect(getNotice).to.deep.equal(userNotice)
    })

    it('should throw error when the notice does not exist', async () => {
      db.notice.findFirst.rejects(new EntityNotExistException('notice'))

      await expect(service.getNotice(noticeId, group.id)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('getAdminNoticesByGroupId', () => {
    const noticeArray = [
      {
        id: noticePrev.id,
        title: noticePrev.title,
        updateTime: noticePrev.updateTime,
        visible: noticePrev.visible,
        fixed: noticePrev.fixed
      },
      {
        id: notice.id,
        title: notice.title,
        updateTime: notice.updateTime,
        visible: notice.visible,
        fixed: notice.fixed
      },
      {
        id: noticeNext.id,
        title: noticeNext.title,
        updateTime: noticeNext.updateTime,
        visible: noticeNext.visible,
        fixed: noticeNext.fixed
      }
    ]

    it('should return notice list of the group', async () => {
      db.notice.findMany.resolves(noticeArray)

      const getNoticesByGroupId = await service.getAdminNoticesByGroupId(
        groupId,
        1
      )
      expect(getNoticesByGroupId).to.deep.equal(noticeArray)
    })
  })

  describe('getAdminNotice', () => {
    const adminNotice = {
      group: {
        groupName: group.groupName
      },
      title: notice.title,
      content: notice.content,
      visible: notice.visible,
      fixed: notice.fixed
    }

    it('should return a notice', async () => {
      db.notice.findUnique.onFirstCall().resolves(adminNotice)

      const getNotice = await service.getAdminNotice(noticeId)
      expect(getNotice).to.deep.equal(adminNotice)
      db.notice.findUnique.reset()
    })

    it('should throw error when given notice does not exist', async () => {
      db.notice.findUnique
        .onFirstCall()
        .rejects(new EntityNotExistException('notice'))

      await expect(service.getAdminNotice(noticeId)).to.be.rejectedWith(
        EntityNotExistException
      )
      db.notice.findUnique.reset()
    })
  })

  describe('getAdminNotices', () => {
    const noticeArray = [
      {
        id: noticePrev.id,
        group: {
          id: group.id,
          groupName: group.groupName
        },
        title: noticePrev.title,
        updateTime: noticePrev.updateTime,
        visible: noticePrev.visible
      },
      {
        id: notice.id,
        group: {
          id: group.id,
          groupName: group.groupName
        },
        title: notice.title,
        updateTime: notice.updateTime,
        visible: notice.visible
      },
      {
        id: noticeNext.id,
        group: {
          id: group.id,
          groupName: group.groupName
        },
        title: noticeNext.title,
        updateTime: noticeNext.updateTime,
        visible: noticeNext.visible
      }
    ]

    it('should return notice list in open space', async () => {
      db.notice.findMany.resolves(noticeArray)

      const getNotices = await service.getAdminNotices(1)
      expect(getNotices).to.deep.equal(noticeArray)
    })
  })

  describe('updateNotice', () => {
    afterEach(() => {
      db.notice.findUnique.resolves(notice)
    })

    it('should return updated Notice', async () => {
      const updateResult = await service.updateNotice(noticeId, updateNoticeDto)
      expect(updateResult).to.deep.equal(notice)
    })

    it('should throw error when given notice does not exist', async () => {
      db.notice.findUnique.rejects(new EntityNotExistException('notice'))
      await expect(
        service.updateNotice(noticeId, updateNoticeDto)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('deleteContest', () => {
    afterEach(() => {
      db.notice.delete.reset()
    })

    it('should successfully delete given notice', async () => {
      await service.deleteNotice(noticeId)
      expect(db.notice.delete.calledOnce).to.be.true
    })

    it('should throw error when given notice does not exist', async () => {
      db.notice.findUnique.rejects(new EntityNotExistException('notice'))

      await expect(service.deleteNotice(noticeId)).to.be.rejectedWith(
        EntityNotExistException
      )
      expect(db.notice.delete.called).to.be.false
    })
  })
})
