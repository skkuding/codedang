import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CourseNoticeService } from './group.service'

const groupId = 1
const courseNoticeId = 10

const notice = {
  groupId,
  title: 'Original',
  content: '<p>original</p>',
  blueprintNoticeId: null as number | null
}

const createDb = () => ({
  courseNotice: {
    findUnique: stub(),
    update: stub().resolves({ id: courseNoticeId })
  },
  userGroup: { findMany: stub().resolves([{ userId: 1 }]) }
})

describe('CourseNoticeService.updateCourseNotice with blueprint copies', () => {
  let service: CourseNoticeService
  let db: ReturnType<typeof createDb>

  beforeEach(async () => {
    db = createDb()
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseNoticeService, { provide: PrismaService, useValue: db }]
    }).compile()
    service = module.get(CourseNoticeService)
  })

  for (const [label, input] of [
    ['title', { title: 'Changed' }],
    ['content', { content: '<p>changed</p>' }],
    ['an unchanged title', { title: notice.title }]
  ] as const) {
    it(`rejects editing the ${label} of a linked copy`, async () => {
      db.courseNotice.findUnique.resolves({ ...notice, blueprintNoticeId: 5 })

      await expect(
        service.updateCourseNotice(groupId, courseNoticeId, input)
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'Confirm unlinkBlueprintNotice before editing this linked notice'
      )
      expect(db.courseNotice.update.called).to.be.false
    })
  }

  it('lets a section change visibility and pinning of a linked copy', async () => {
    db.courseNotice.findUnique.resolves({ ...notice, blueprintNoticeId: 5 })

    await service.updateCourseNotice(groupId, courseNoticeId, {
      isFixed: true,
      isPublic: false
    })

    expect(db.courseNotice.update.firstCall.args[0]).to.deep.equal({
      where: { id: courseNoticeId },
      data: { isFixed: true, isPublic: false }
    })
  })

  it('keeps editing title and content of an unlinked notice', async () => {
    db.courseNotice.findUnique.resolves(notice)

    await service.updateCourseNotice(groupId, courseNoticeId, {
      title: 'Changed'
    })

    // markAsUnread clears readBy first, then the notice itself is updated.
    expect(db.courseNotice.update.lastCall.args[0].data).to.deep.equal({
      title: 'Changed'
    })
  })
})
