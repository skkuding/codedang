import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PrismaService } from '@libs/prisma'
import type { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'

@Injectable()
export class NoticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * 새로운 공지를 생성합니다.
   * @param {number} userId 공지를 생성한 유저 아이디
   * @param {CreateNoticeInput} createNoticeInput 공지 생성에 필요한 데이터
   * @returns {Notice} 생성된 notice 객체 반환
   */
  async createNotice(userId: number, createNoticeInput: CreateNoticeInput) {
    const noticeCreated = await this.prisma.notice.create({
      data: {
        createdById: userId,
        ...createNoticeInput
      }
    })
    this.eventEmitter.emit('notice.created', {
      noticeId: noticeCreated.id
    })

    return noticeCreated
  }

  /**
   * 공지를 삭제합니다.
   * @param {number} noticeId 공지 아이디
   * @returns {Notice} 삭제된 notice 객체 반환
   */
  async deleteNotice(noticeId: number) {
    return await this.prisma.notice.delete({
      where: {
        id: noticeId
      }
    })
  }

  /**
   * 기존 공지 내용을 업데이트 합니다.
   * @param {number} noticeId 공지 아이디
   * @param {UpdateNoticeInput} updateNoticeInput 공지 업데이트에 필요한 데이터
   * @returns {Notice} 업데이트 된 notice 객체 반환
   */
  async updateNotice(noticeId: number, updateNoticeInput: UpdateNoticeInput) {
    return await this.prisma.notice.update({
      where: {
        id: noticeId
      },
      data: updateNoticeInput
    })
  }

  /**
   * 공지를 조회합니다.
   * @param {number} noticeId 공지 아이디
   * @returns {Notice} 아이디에 해당하는 공지사항 반환
   */
  async getNotice(noticeId: number) {
    return await this.prisma.notice.findUniqueOrThrow({
      where: {
        id: noticeId
      }
    })
  }

  /**
   * 공지사항들을 페이지 조건에 맞게 조회
   * @param {number} cursor 다음 페이지 조회를 위한 기준 커서
   * @param {number} take 한 페이지에 조회할 공지의 개수
   * @returns {Notice[]} 조회된 공지사항들을 반환
   */
  async getNotices(cursor: number | null, take: number) {
    const paginator = this.prisma.getPaginator(cursor)
    return await this.prisma.notice.findMany({
      ...paginator,
      take
    })
  }
}
