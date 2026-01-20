import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { CreateAnnouncementInput } from './model/create-announcement.input'
import type { UpdateAnnouncementInput } from './model/update-announcement.input'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 특정 대회에 새로운 공지를 등록합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {CreateAnnouncementInput} input 공지 생성 데이터 (problemOrder 문제 순서 - optional, content 내용)
   * @returns 등록된 공지 정보
   */
  async createAnnouncement(contestId: number, input: CreateAnnouncementInput) {
    const { problemOrder, content } = input

    await this.prisma.contest.findUniqueOrThrow({
      where: { id: contestId }
    })

    let problemId: number | null = null

    if (problemOrder != null) {
      const contestProblem = await this.prisma.contestProblem.findFirstOrThrow({
        where: {
          contestId,
          order: problemOrder
        },
        select: { problemId: true }
      })

      problemId = contestProblem.problemId
    }

    return await this.prisma.announcement.create({
      data: {
        problemId,
        contestId,
        content
      }
    })
  }

  /**
   * 특정 대회에 해당하는 모든 공지를 조회합니다
   *
   * @param {number} contestId 대회 ID
   * @returns 대회 공지 리스트 (공지는 문제 순서를 함께 반환)
   */
  async getAnnouncementsByContestId(contestId: number) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })

    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId }
    })
    const problemOrderMap = {}
    contestProblems.forEach((problem, index) => {
      problemOrderMap[problem.problemId] = index
    })

    const announcements = await this.prisma.announcement.findMany({
      where: { contestId },
      orderBy: { createTime: 'desc' }
    })

    return announcements.map((announcement) => {
      return {
        ...announcement,
        problemOrder: announcement.problemId
          ? problemOrderMap[announcement.problemId]
          : null
      }
    })
  }

  /**
   * 특정 대회 내의 특정 공지 상세 정보 조회합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} id 공지사항 ID
   * @returns 공지 상세 정보
   */
  async getAnnouncementById(contestId: number, id: number) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })

    return await this.prisma.announcement.findUniqueOrThrow({
      where: { id }
    })
  }

  async updateAnnouncement(contestId: number, input: UpdateAnnouncementInput) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })
    const { id, ...data } = input
    await this.prisma.announcement.findUniqueOrThrow({ where: { id } })

    return await this.prisma.announcement.update({
      where: { id },
      data
    })
  }

  async removeAnnouncement(contestId: number, id: number) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })
    await this.prisma.announcement.findUniqueOrThrow({ where: { id } })

    return await this.prisma.announcement.delete({
      where: { id }
    })
  }
}
