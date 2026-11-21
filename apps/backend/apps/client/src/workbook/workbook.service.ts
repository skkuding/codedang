import { Injectable } from '@nestjs/common'
import type { Workbook, Problem } from '@prisma/client'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets the visible (isVisible) workbooks of a group with cursor-based pagination.
   *
   * @param {number | null} cursor Pagination cursor (ID of the last fetched workbook)
   * @param {number} take Number of workbooks to fetch
   * @param {number} groupId Group ID
   * @returns Workbooks (`data`) and the total number of visible workbooks (`total`)
   */
  async getWorkbooksByGroupId(
    cursor: number | null,
    take: number,
    groupId: number
  ) {
    const paginator = this.prisma.getPaginator(cursor)

    const workbooks = await this.prisma.workbook.findMany({
      ...paginator,
      where: {
        groupId,
        isVisible: true
      },
      take,
      select: {
        id: true,
        title: true,
        description: true,
        updateTime: true
      }
    })

    const total = await this.prisma.workbook.count({
      where: {
        groupId,
        isVisible: true
      }
    })

    return { data: workbooks, total }
  }

  /**
   * Gets a visible workbook and its problems.
   *
   * @param {number} workbookId Workbook ID
   * @param {number} groupId Group ID
   * @returns Workbook ID, title, and problems (problem ID, title, and tag names)
   * @throws {EntityNotExistException} If the workbook does not exist in the group or is not visible
   */
  async getWorkbook(
    workbookId: number,
    groupId: number
  ): Promise<Partial<Workbook> & { problems: Partial<Problem>[] }> {
    const workbook = await this.prisma.workbook.findUnique({
      where: { id: workbookId, groupId, isVisible: true },
      select: { id: true, title: true }
    })
    if (!workbook) {
      throw new EntityNotExistException('Workbook')
    }

    const rawProblems = await this.prisma.workbookProblem.findMany({
      where: { workbookId },
      select: {
        problem: {
          select: {
            id: true,
            title: true,
            problemTag: {
              select: {
                tag: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    const problems = rawProblems.map((x) => ({
      id: x.problem.id,
      title: x.problem.title,
      tags: x.problem.problemTag.map((y) => y.tag.name)
    }))

    return {
      ...workbook,
      problems
    }
  }

  /**
   * Checks whether a workbook in a group is visible.
   *
   * @param {number} id Workbook ID
   * @param {number} groupId Group ID
   * @returns true if a visible workbook exists, otherwise false
   */
  async isVisible(id: number, groupId: number): Promise<boolean> {
    return !!(await this.prisma.workbook.count({
      where: { id, groupId, isVisible: true }
    }))
  }
}
