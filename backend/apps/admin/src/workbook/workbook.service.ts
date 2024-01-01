import { Injectable } from '@nestjs/common'
import type { Workbook, WorkbookProblem } from '@generated'
import {
  ConflictFoundException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { CreateWorkbookInput } from './model/workbook.input'
import type { UpdateWorkbookInput } from './model/workbook.input'
import type { WorkbookDetail } from './model/workbook.output'

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

  //TODO: 기획에서 WorkbookDetail에 대한 구체적인 정의가 필요함
  //일단은 Workbook, Submission, Problem을 모두 포함하는 형태로 구현
  async getWorkbook(
    groupId: number,
    workbookId: number
  ): Promise<Partial<WorkbookDetail>> {
    const workbookAndSubmissions = await this.prisma.workbook.findFirstOrThrow({
      where: { groupId, id: workbookId },
      include: {
        submission: true
      }
    })

    const workbookProblemsAndProblems =
      await this.prisma.workbookProblem.findMany({
        where: { workbookId: workbookId },
        include: {
          problem: true
        }
      })
    const { submission, ...workbook } = workbookAndSubmissions

    if (workbookProblemsAndProblems.length === 0) {
      return { ...workbook, submissions: submission, problems: [] }
    }
    return {
      ...workbook,
      submissions: submission,
      problems: workbookProblemsAndProblems.map((record) => record.problem)
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

  async createWorkbookProblems(
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
            order: problemId,
            workbookId: workbookId,
            problemId: problemId
          }
        })
      )
    }
    return newWorkbookProblems
  }
}
