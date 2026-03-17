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
   * 1. 대회의 존재 여부를 먼저 확인
   * 2. problemOrder가 제공된 경우, 해당 대회 내의 문제 순서를 조회하여 연결
   * 3. 찾은 problemId와 입력받은 content를 사용하여 새로운 공지를 생성
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
   * 1. 해당 대회의 존재 여부를 확인
   * 2. 대회에 포함된 모든 문제 정보를 가져온 수
   * 3. problemId를 key로, 배열 인덱스를 value로 갖는 매핑 테이블(problemOrderMap) 생성
   * 4. 공지 목록을 최신순으로 조회한 후
   * 5. 각 공지에 매핑 테이블을 사용해 problemOrder(배열 인덱스)를 부여하여 반환
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
   * 1. 대회와 해당 공지의 존재 여부를 확인
   * 2. 공지의 상세 내용 반환
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

  /**
   * 특정 대회 내의 기존 공지 정보 수정
   *
   * 1. 대회 및 공지 존재 여부를 확인
   * 2. input을 기반으로 공지 내용을 업데이트
   *
   * @param {number} contestId 대회 ID
   * @param {UpdateAnnouncementInput} input 수정할 데이터
   * @returns 업데이트된 공지 정보
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
   * 특정 대회 내의 공지를 삭제합니다
   *
   * 1. 삭제 전 대회와 공지가 실제로 존재하는지 확인
   * 2. 해당 공지 데이터를 삭제하고 삭제된 정보를 반환
   *
   * @param {number} contestId 대회 ID
   * @param {number} id 삭제할 공지사항 ID
   * @returns 삭제된 공지 정보
   */
  async removeAnnouncement(contestId: number, id: number) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })
    await this.prisma.announcement.findUniqueOrThrow({ where: { id } })

    return await this.prisma.announcement.delete({
      where: { id }
    })
  }
}
