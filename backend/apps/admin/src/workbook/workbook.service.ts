import { Injectable } from '@nestjs/common'
import {
  Prisma,
  type Workbook,
  type Problem,
  type Submission
} from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CreateWorkbookDto } from './dto/create-workbook.dto'
import { DeleteWorkbookDto } from './dto/delete-workbook.dto'
import { GetWorkbookDto } from './dto/get-workbook.dto'
import { GetWorkbookListInput } from './dto/input/workbook.input'
import { CreateWorkbookInput } from './dto/input/workbook.input'
import { UpdateWorkbookInput } from './dto/input/workbook.input'
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
    getWorkbookListInput: GetWorkbookListInput
  ): Promise<Partial<Workbook>[]> {
    const groupId = getWorkbookListInput.groupId
    let cursor = getWorkbookListInput.cursor
    const take = getWorkbookListInput.take
    let skip = 1
    if (!cursor) {
      cursor = 1
      skip = 0
    }
    const workbookList = await this.prisma.workbook.findMany({
      where: { groupId },
      select: {
        id: true,
        title: true,
        description: true,
        isVisible: true,
        createdBy: true,
        updateTime: true
      },
      skip: skip,
      take: take,
      cursor: {
        id: cursor
      }
    })
    console.log(workbookList)
    return workbookList
  }

  async getWorkbookById(workbookId: number): Promise<
    Partial<Workbook> & { problems: Partial<Problem>[] } & {
      submissions: Partial<Submission>[]
    }
  > {
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

    const submissions = await this.prisma.submission.findMany({
      where: { workbookId },
      select: {
        id: true,
        user: {
          select: {
            username: true
          }
        },
        userId: true,
        code: true,
        language: true
      }
    })
    console.log(workbook)
    console.log(problems)
    console.log(submissions)
    return {
      ...workbook,
      problems,
      submissions
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
    createWorkbookInput: CreateWorkbookInput,
    userId: number
  ): Promise<Workbook> {
    console.log(createWorkbookInput)
    const newWorkbook = await this.prisma.workbook.create({
      data: {
        createdById: userId,
        groupId: createWorkbookInput.groupId,
        title: createWorkbookInput.title,
        description: createWorkbookInput.title,
        isVisible: createWorkbookInput.isVisible
      }
    })
    return newWorkbook
  }

  async updateWorkbook(
    updateWorkbookInput: UpdateWorkbookInput
  ): Promise<Workbook> {
    try {
      const { id, ...rest } = updateWorkbookInput
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

  async deleteWorkbook(id: number): Promise<Workbook> {
    try {
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

  async mapProblemstoWorkbook(
    problemIds: number[],
    workbookId: number
  ): Promise<boolean> {
    try {
      for (const problemId of problemIds) {
        await this.prisma.workbookProblem.create({
          data: {
            id: problemId.toString(),
            workbookId: workbookId,
            problemId: problemId
          }
        })
      }
      return true
    } catch (error) {
      return false
    }
  }
}
