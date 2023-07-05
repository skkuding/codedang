import { Injectable } from '@nestjs/common'
import { Prisma, type Workbook, type Problem } from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CreateWorkbookDto } from './dto/create-workbook.dto'
import { DeleteWorkbookDto } from './dto/delete-workbook.dto'
import { GetWorkbookDto } from './dto/get-workbook.dto'
import { UpdateWorkbookDto } from './dto/update-workbook.dto'

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
    getWorkbookDto: GetWorkbookDto
  ): Promise<Partial<Workbook>[]> {
    const groupId = getWorkbookDto.groupId
    let cursor = getWorkbookDto.cursor
    const take = getWorkbookDto.take
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
    console.log(workbooks)
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
    userId: number
  ): Promise<Workbook> {
    const newWorkbook = await this.prisma.workbook.create({
      data: {
        createdById: userId,
        ...createWorkbookDto
      }
    })
    return newWorkbook
  }

  async updateWorkbook(
    updateWorkbookDto: UpdateWorkbookDto
  ): Promise<Workbook> {
    try {
      const { id, ...rest } = updateWorkbookDto
      const updatedWorkbook = await this.prisma.workbook.update({
        where: {
          id: id
        },
        data: rest
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

  async deleteWorkbook(
    deleteWorkbookDto: DeleteWorkbookDto
  ): Promise<Workbook> {
    try {
      const { groupId, id } = deleteWorkbookDto
      const deletedWorkbook = await this.prisma.workbook.delete({
        where: {
          id: id
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
