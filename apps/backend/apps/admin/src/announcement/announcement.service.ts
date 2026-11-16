import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { CreateAnnouncementInput } from './model/create-announcement.input'
import type { UpdateAnnouncementInput } from './model/update-announcement.input'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 대회에 새로운 공지를 생성합니다.
   * problemOrder가 주어지면 해당 순서의 대회 문제에 연결된 공지로 생성합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {CreateAnnouncementInput} input 공지 내용 및 연결할 문제 순서(problemOrder)
   * @returns 생성된 공지
   * @throws {NotFoundException} 아래와 같은 경우 발생합니다.
   * - contestId에 해당하는 대회가 없는 경우
   * - problemOrder에 해당하는 대회 문제가 없는 경우
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
   * 대회의 공지 목록을 최신순으로 조회합니다.
   * problemOrder는 contestProblem의 order가 아닌, 정렬 없이 조회한 contestProblem 배열의 인덱스(0부터)입니다.
   *
   * @param {number} contestId 대회 ID
   * @returns problemOrder가 포함된 공지 목록 (문제와 연결되지 않은 공지는 null)
   * @throws {NotFoundException} contestId에 해당하는 대회가 없는 경우 발생합니다.
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
   * 특정 공지를 조회합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} id 공지 ID
   * @returns 조회한 공지
   * @throws {NotFoundException} 아래와 같은 경우 발생합니다.
   * - contestId에 해당하는 대회가 없는 경우
   * - id에 해당하는 공지가 없는 경우
   */
  async getAnnouncementById(contestId: number, id: number) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })

    return await this.prisma.announcement.findUniqueOrThrow({
      where: { id }
    })
  }

  /**
   * 공지 내용을 수정합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {UpdateAnnouncementInput} input 수정할 공지 ID 및 수정할 데이터
   * @returns 수정된 공지
   * @throws {NotFoundException} 아래와 같은 경우 발생합니다.
   * - contestId에 해당하는 대회가 없는 경우
   * - input.id에 해당하는 공지가 없는 경우
   */
  async updateAnnouncement(contestId: number, input: UpdateAnnouncementInput) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })
    const { id, ...data } = input
    await this.prisma.announcement.findUniqueOrThrow({ where: { id } })

    return await this.prisma.announcement.update({
      where: { id },
      data
    })
  }

  /**
   * 공지를 삭제합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} id 삭제할 공지 ID
   * @returns 삭제된 공지
   * @throws {NotFoundException} 아래와 같은 경우 발생합니다.
   * - contestId에 해당하는 대회가 없는 경우
   * - id에 해당하는 공지가 없는 경우
   */
  async removeAnnouncement(contestId: number, id: number) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })
    await this.prisma.announcement.findUniqueOrThrow({ where: { id } })

    return await this.prisma.announcement.delete({
      where: { id }
    })
  }
}
