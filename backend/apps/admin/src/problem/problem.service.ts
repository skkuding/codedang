import { Injectable } from '@nestjs/common'
import { isDefined } from 'class-validator'
import { PrismaService } from '@libs/prisma'
import type { ProblemWhereInput } from '@admin/@generated/problem/problem-where.input'
import type { CreateGroupProblemInput } from './dto/create-problem.dto'
import type {
  DeleteGroupProblemInput,
  GetGroupProblemInput,
  GetGroupProblemsInput
} from './dto/request-problem.dto'
import type { UpdateProblemInput } from './dto/update-problem.dto'

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroupProblem(
    createdById: number,
    input: CreateGroupProblemInput
  ) {
    const problemTestcases = {
      create: input.problemTestcase
    }

    let tagsId
    if (isDefined(input.problemTag)) {
      tagsId = input.problemTag.map((value) => {
        return {
          tagId: value
        }
      })
    }

    const { problemTag, problemTestcase, ...data } = input

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return await this.prisma.problem.create({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      data: {
        ...data,
        createdById: createdById,
        problemTestcase: problemTestcases,
        problemTag: {
          create: tagsId
        }
      }
    })
  }

  async getGroupProblems(input: GetGroupProblemsInput) {
    const whereOptions: ProblemWhereInput = {
      groupId: { equals: input.groupId }
    }

    if (isDefined(input.createdById)) {
      whereOptions.createdById = { equals: input.createdById }
    }

    if (isDefined(input.difficulty)) {
      whereOptions.difficulty = {
        in: input.difficulty
      }
    }

    if (isDefined(input.languages)) {
      whereOptions.languages = { hasSome: input.languages }
    }

    return await this.prisma.problem.findMany({
      where: {
        ...whereOptions
      },
      cursor: {
        id: input.cursor < 1 ? 1 : input.cursor
      },
      skip: input.cursor < 1 ? 0 : 1,
      take: input.take
    })
  }

  async getGroupProblem(input: GetGroupProblemInput) {
    return await this.prisma.problem.findUniqueOrThrow({
      where: {
        id: input.problemId
      }
    })
  }

  async updateGroupProblem(input: UpdateProblemInput) {
    const { problemId, ...data } = input

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return await this.prisma.problem.update({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      where: {
        id: problemId
      },
      data: {
        ...data
      }
    })
  }

  async deleteGroupProblem(input: DeleteGroupProblemInput) {
    return await this.prisma.problem.delete({
      where: {
        id: input.problemId
      }
    })
  }
}
