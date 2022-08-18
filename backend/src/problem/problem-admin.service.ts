import { Injectable } from '@nestjs/common'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ProblemAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // DTO로 수정하기
  private adminProblemsField = {
    id: true,
    title: true,
    difficulty: true,
    last_update: true
  }

  async getGroupProblem(groupId: number, problemId: number) {
    return this.prisma.groupProblem.findFirst({
      where: { group_id: groupId, problem_id: problemId },
      select: { problem: true }
    })
  }

  async getGroupProblems(groupId: number, paginationDto: PaginationDto) {
    return this.prisma.groupProblem.findMany({
      where: { group_id: groupId },
      select: { problem: { select: { ...this.adminProblemsField } } },
      skip: paginationDto.offset,
      take: paginationDto.limit
    })
  }

  async getGroupContestProblem(
    groupId: number,
    contestId: number,
    problemId: number
  ) {
    if (!(await this.isContestInGroup(groupId, contestId))) {
      // 적절하게 변경
      throw new Error()
    }

    return this.prisma.contestProblem.findFirst({
      where: { contest_id: contestId, problem_id: problemId },
      select: { problem: true }
    })
  }

  private async isContestInGroup(groupId: number, contestId: number) {
    return !!(await this.prisma.contest.count({
      where: { id: contestId, group_id: groupId }
    }))
  }

  async getGroupContestProblems(
    groupId: number,
    contestId: number,
    paginationDto: PaginationDto
  ) {
    if (!(await this.isContestInGroup(groupId, contestId))) {
      // 적절하게 변경
      throw new Error()
    }

    return this.prisma.contestProblem.findMany({
      where: { contest_id: contestId },
      select: { problem: { select: { ...this.adminProblemsField } } },
      skip: paginationDto.offset,
      take: paginationDto.limit
    })
  }

  async getGroupWorkbookProblem(
    groupId: number,
    workbookId: number,
    problemId: number
  ) {
    if (!(await this.isWorkbookInGroup(groupId, workbookId))) {
      // 적절하게 변경
      throw new Error()
    }

    return this.prisma.workbookProblem.findFirst({
      where: { workbook_id: workbookId, problem_id: problemId },
      select: { problem: true }
    })
  }

  private async isWorkbookInGroup(groupId: number, workbookId: number) {
    return !!(await this.prisma.workbook.count({
      where: { id: workbookId, group_id: groupId }
    }))
  }

  async getGroupWorkbookProblems(
    groupId: number,
    workbookId: number,
    paginationDto: PaginationDto
  ) {
    if (!(await this.isWorkbookInGroup(groupId, workbookId))) {
      // 적절하게 변경
      throw new Error()
    }

    return this.prisma.workbookProblem.findMany({
      where: { workbook_id: workbookId },
      select: { problem: { select: { ...this.adminProblemsField } } },
      skip: paginationDto.offset,
      take: paginationDto.limit
    })
  }
}
