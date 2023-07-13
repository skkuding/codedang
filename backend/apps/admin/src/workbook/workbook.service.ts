import { Injectable } from '@nestjs/common'
import {
  Prisma,
  type Workbook,
  type Problem,
  type Submission
} from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { GetWorkbookListInput } from './model/input/workbook.input'
import { CreateWorkbookInput } from './model/input/workbook.input'
import { UpdateWorkbookInput } from './model/input/workbook.input'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  // async getWorkbooksByGroupId(
  //   cursor: number,
  //   take: number,
  //   groupId = OPEN_SPACE_ID
  // ): Promise<Partial<Workbook>[]> {
  //   let skip = 1
  //   if (!cursor) {
  //     cursor = 1
  //     skip = 0
  //   }
  //   const workbooks = await this.prisma.workbook.findMany({
  //     where: {
  //       groupId,
  //       isVisible: true
  //     },
  //     select: { id: true, title: true, description: true, updateTime: true },
  //     skip: skip,
  //     take: take,
  //     cursor: {
  //       id: cursor
  //     }
  //   })
  //   return workbooks
  // }

  async getWorkbookListByGroupId(
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
      skip: skip,
      take: take,
      cursor: {
        id: cursor
      }
    })
    console.log(workbookList)
    return workbookList
  }

  async getWorkbookDetailById(workbookId: number): Promise<
    Partial<Workbook> & { problems: Partial<Problem>[] } & {
      submissions: Partial<Submission>[]
    }
  > {
    const workbook = await this.prisma.workbook.findFirst({
      where: { id: workbookId },
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
      where: { workbookId }
    })

    return {
      ...workbook,
      problems,
      submissions
    }
  }

  // async getAdminWorkbookById(workbookId: number): Promise<Partial<Workbook>> {
  //   const workbook = await this.prisma.workbook.findFirst({
  //     where: { id: workbookId },
  //     select: {
  //       id: true,
  //       title: true,
  //       createdBy: {
  //         select: {
  //           username: true
  //         }
  //       },
  //       isVisible: true
  //     },
  //     rejectOnNotFound: () => new EntityNotExistException('workbook')
  //   })
  //   return workbook
  // }

  async createWorkbook(
    createWorkbookInput: CreateWorkbookInput,
    userId: number
  ): Promise<Workbook> {
    try {
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
    } catch (error) {
      console.error('newWorkbook을 create하는 중에 문제 발생', error)
      throw new Error('record create failed!')
    }
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

  // async isVisible(workbookId: number, groupId: number): Promise<boolean> {
  //   return !!(await this.prisma.workbook.count({
  //     where: {
  //       id: workbookId,
  //       groupId: groupId,
  //       isVisible: true
  //     }
  //   }))
  // }

  async mapProblemstoWorkbook(
    problemIds: number[],
    workbookId: number
  ): Promise<boolean> {
    for (const problemId of problemIds) {
      const existingRecord = await this.prisma.workbookProblem.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          workbookId_problemId: {
            workbookId: workbookId,
            problemId: problemId
          }
        }
      })

      if (existingRecord) {
        throw new UnprocessableDataException('the same record already exists')
      }
      try {
        await this.prisma.workbookProblem.create({
          data: {
            // FE에서 넘겨주는 건지, 아니면 BE에서 problemID와 같게 Default로 설정해야 하는지 잘 모르겠음.
            id: problemId.toString(),
            workbookId: workbookId,
            problemId: problemId
          }
        })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new Error('for some reason, creating record failed')
        }
      }
    }

    return true
  }
}
