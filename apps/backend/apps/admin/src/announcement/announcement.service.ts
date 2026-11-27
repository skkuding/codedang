import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { CreateAnnouncementInput } from './model/create-announcement.input'
import type { UpdateAnnouncementInput } from './model/update-announcement.input'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new announcement for a contest.
   * If problemOrder is given, the announcement is linked to the contest problem at that order.
   *
   * @param {number} contestId Contest ID
   * @param {CreateAnnouncementInput} input Announcement content and the order of the problem to link (problemOrder)
   * @returns The created announcement
   * @throws {Prisma.PrismaClientKnownRequestError} Thrown with code P2025 in the following cases:
   * - The contest with contestId does not exist
   * - No contest problem exists at problemOrder
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
   * Gets the announcements of a contest, newest first.
   * problemOrder is not the contestProblem order but the zero-based index in the unsorted contestProblem array.
   *
   * @param {number} contestId Contest ID
   * @returns Announcements with problemOrder (null for announcements not linked to a problem)
   * @throws {Prisma.PrismaClientKnownRequestError} Thrown with code P2025 if the contest with contestId does not exist
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
   * Gets a single announcement.
   *
   * @param {number} contestId Contest ID
   * @param {number} id Announcement ID
   * @returns The announcement
   * @throws {Prisma.PrismaClientKnownRequestError} Thrown with code P2025 in the following cases:
   * - The contest with contestId does not exist
   * - The announcement with id does not exist
   */
  async getAnnouncementById(contestId: number, id: number) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })

    return await this.prisma.announcement.findUniqueOrThrow({
      where: { id }
    })
  }

  /**
   * Updates an announcement.
   *
   * @param {number} contestId Contest ID
   * @param {UpdateAnnouncementInput} input ID of the announcement to update and the data to change
   * @returns The updated announcement
   * @throws {Prisma.PrismaClientKnownRequestError} Thrown with code P2025 in the following cases:
   * - The contest with contestId does not exist
   * - The announcement with input.id does not exist
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
   * Deletes an announcement.
   *
   * @param {number} contestId Contest ID
   * @param {number} id ID of the announcement to delete
   * @returns The deleted announcement
   * @throws {Prisma.PrismaClientKnownRequestError} Thrown with code P2025 in the following cases:
   * - The contest with contestId does not exist
   * - The announcement with id does not exist
   */
  async removeAnnouncement(contestId: number, id: number) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })
    await this.prisma.announcement.findUniqueOrThrow({ where: { id } })

    return await this.prisma.announcement.delete({
      where: { id }
    })
  }
}
