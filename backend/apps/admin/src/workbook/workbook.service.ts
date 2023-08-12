import { Injectable } from '@nestjs/common'
import type {
  Workbook,
  Problem,
  Submission,
  WorkbookProblem
} from '@prisma/client'
// import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
// import type { WorkbookUpdateInput } from '@admin/@generated'
// import type { GetWorkbookListInput } from './model/input/workbook.input'
import type { CreateWorkbookInput } from './model/workbook.input'
import type { UpdateWorkbookInput } from './model/workbook.input'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkbooks(
    groupId: number,
    cursor: number,
    take: number
  ): Promise<Partial<Workbook>[]> {
    let skip = 1
    if (!cursor) {
      cursor = 1
      skip = 0
    }
    const workbooks = await this.prisma.workbook.findMany({
      where: { groupId },
      skip: skip,
      take: take,
      cursor: {
        id: cursor
      }
    })
    return workbooks
  }

  async getWorkbook(
    groupId: number,
    workbookId: number
  ): Promise<
    Partial<Workbook> & { problems: Partial<Problem>[] } & {
      submissions: Partial<Submission>[]
    }
  > {
    const workbook = await this.prisma.workbook.findFirstOrThrow({
      where: { groupId, id: workbookId },
      select: { id: true, title: true }
    })

    const rawProblems = await this.prisma.workbookProblem.findMany({
      where: { workbookId },
      select: {
        problem: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    const problems = rawProblems.map((x) => ({
      id: x.problem.id,
      title: x.problem.title
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

  async createWorkbook(
    groupId: number,
    createWorkbookInput: CreateWorkbookInput,
    userId: number
  ): Promise<Workbook> {
    const newWorkbook = await this.prisma.workbook.create({
      data: {
        createdById: userId,
        groupId: groupId,
        title: createWorkbookInput.title,
        description: createWorkbookInput.title,
        isVisible: createWorkbookInput.isVisible
      }
    })
    return newWorkbook
  }

  async updateWorkbook(
    groupId: number,
    updateWorkbookInput: UpdateWorkbookInput
  ): Promise<Workbook> {
    const { id, ...data } = updateWorkbookInput
    await this.prisma.workbook.findFirstOrThrow({
      where: { groupId: groupId, id: id }
    })

    const updatedWorkbook = await this.prisma.workbook.update({
      where: {
        id: id
      },
      data: data
    })
    return updatedWorkbook
  }

  async deleteWorkbook(id: number): Promise<Workbook> {
    await this.prisma.workbook.findFirstOrThrow({
      where: { id: id }
    })
    const deletedWorkbook = await this.prisma.workbook.delete({
      where: {
        id: id
      }
    })
    return deletedWorkbook
  }

  async createWorkbookProblem(
    groupId: number,
    problemIds: number[],
    workbookId: number
  ): Promise<Partial<WorkbookProblem>[]> {
    await this.prisma.workbook.findFirstOrThrow({
      where: {
        groupId: groupId,
        id: workbookId
      }
    })
    const newWorkbookProblems: WorkbookProblem[] = []
    for (const problemId of problemIds) {
      const problem = await this.prisma.problem.findFirstOrThrow({
        where: { id: problemId }
      })
      if (problem.groupId !== groupId) {
        throw new UnprocessableDataException(
          'problem does not belong to the group'
        )
      }
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
        throw new ConflictFoundException('already exisiting record')
      }
      newWorkbookProblems.push(
        await this.prisma.workbookProblem.create({
          data: {
            // problemID와 같게 Default로 설정
            id: problemId.toString(),
            workbookId: workbookId,
            problemId: problemId
          }
        })
      )
    }
    return newWorkbookProblems
  }
}
