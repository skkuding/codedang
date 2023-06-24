import { Injectable } from '@nestjs/common'
import { Prisma, type Workbook, type Problem } from '@prisma/client'
import { EntityNotExistException } from '@client/common/exception/business.exception'
import { PrismaService } from '@libs/prisma'
import type { CreateWorkbookDto } from './dto/create-workbook.dto'
import type { UpdateWorkbookDto } from './dto/update-workbook.dto'
import { OPEN_SPACE_ID } from '@client/common/constants'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkbooksByGroupId(
    cursor: number,
    take: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Workbook>[]> {
    let skip = 1
    if (!cursor) {
      cursor = 1
      skip = 0
    }
    const workbooks = await this.prisma.workbook.findMany({
      where: {
        groupId,
        isVisible: true
      },
      select: { id: true, title: true, description: true, updateTime: true },
      skip: skip,
      take: take,
      cursor: {
        id: cursor
      }
    })
    return workbooks
  }

  async getAdminWorkbooksByGroupId(
    cursor,
    take,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Workbook>[]> {
    let skip = 1
    if (!cursor) {
      cursor = 1
      skip = 0
    }
    const workbooks = await this.prisma.workbook.findMany({
      where: { groupId },
      select: { id: true, title: true, description: true, updateTime: true },
      skip: skip,
      take: take,
      cursor: {
        id: cursor
      }
    })
    return workbooks
  }

  async getWorkbookById(
    workbookId: number
  ): Promise<Partial<Workbook> & { problems: Partial<Problem>[] }> {
    const workbook = await this.prisma.workbook.findFirst({
      where: { id: workbookId, isVisible: true },
      select: { id: true, title: true },
      rejectOnNotFound: () => new EntityNotExistException('workbook')
    })

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

  async getAdminWorkbookById(workbookId: number): Promise<Partial<Workbook>> {
    const workbook = await this.prisma.workbook.findFirst({
      where: { id: workbookId },
      select: {
        id: true,
        title: true,
        createdBy: {
          select: {
            username: true
          }
        },
        isVisible: true
      },
      rejectOnNotFound: () => new EntityNotExistException('workbook')
    })
    return workbook
  }

  async createWorkbook(
    createWorkbookDto: CreateWorkbookDto,
    userId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Workbook> {
    const newWorkbook = await this.prisma.workbook.create({
      data: {
        groupId,
        createdById: userId,
        ...createWorkbookDto
      }
    })
    return newWorkbook
  }

  async updateWorkbook(
    workbookId: number,
    updateWorkbookDto: UpdateWorkbookDto
  ): Promise<Workbook> {
    try {
      const updatedWorkbook = await this.prisma.workbook.update({
        where: {
          id: workbookId
        },
        data: {
          ...updateWorkbookDto
        }
      })
      return updatedWorkbook
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('workbook')
      } else {
        throw error
      }
    }
  }

  async deleteWorkbook(workbookId: number): Promise<Workbook> {
    try {
      const deletedWorkbook = await this.prisma.workbook.delete({
        where: {
          id: workbookId
        }
      })
      return deletedWorkbook
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('workbook')
      } else {
        throw error
      }
    }
  }

  async isVisible(workbookId: number, groupId: number): Promise<boolean> {
    return !!(await this.prisma.workbook.count({
      where: {
        id: workbookId,
        groupId: groupId,
        isVisible: true
      }
    }))
  }
}
