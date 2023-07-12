import { Injectable, UnauthorizedException } from '@nestjs/common'
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
    groupId: number,
    input: CreateGroupProblemInput
  ) {
    if (groupId != input.groupId) {
      throw new UnauthorizedException()
    }

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

  async getGroupProblems(groupId: number, input: GetGroupProblemsInput) {
    const whereOptions: ProblemWhereInput = {}

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
        ...whereOptions,
        groupId: groupId
      },
      cursor: {
        id: input.cursor < 1 ? 1 : input.cursor
      },
      skip: input.cursor < 1 ? 0 : 1,
      take: input.take
    })
  }

  async getGroupProblem(groupId: number, input: GetGroupProblemInput) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id: input.problemId,
        groupId: groupId
      }
    })
    return problem
  }

  async updateGroupProblem(groupId: number, input: UpdateProblemInput) {
    const { problemId, ...data } = input

    await this.getGroupProblem(groupId, { problemId: problemId })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return await this.prisma.problem.update({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      where: {
        id: problemId
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      data: {
        ...data
      }
    })
  }

  async deleteGroupProblem(groupId: number, input: DeleteGroupProblemInput) {
    await this.getGroupProblem(groupId, { problemId: input.problemId })
    return await this.prisma.problem.delete({
      where: {
        id: input.problemId
      }
    })
  }
}
