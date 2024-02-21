import { Injectable } from '@nestjs/common'
import type { Workbook, Problem } from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkbooksByGroupId(
    cursor: number | null,
    take: number,
    groupId = OPEN_SPACE_ID
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
    return workbooks
  }

  async getWorkbook(
    workbookId: number,
    groupId = OPEN_SPACE_ID
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

  async isVisible(id: number, groupId: number): Promise<boolean> {
    return !!(await this.prisma.workbook.count({
      where: { id, groupId, isVisible: true }
    }))
  }
}
