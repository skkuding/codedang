import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { ProblemWhereInput } from '@admin/@generated/problem/problem-where.input'
import type { CreateGroupProblemInput } from './model/create-problem.input'
import type { GetGroupProblemsInput } from './model/request-problem.input'
import type { UpdateProblemInput } from './model/update-problem.input'

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroupProblem(
    createdById: number,
    groupId: number,
    input: CreateGroupProblemInput
  ) {
    const problemTestcases = {
      create: input.problemTestcase
    }

    const tagsId = input.problemTag.map((value) => {
      return {
        tagId: value
      }
    })

    const { problemTag, problemTestcase, ...data } = input

    return await this.prisma.problem.create({
      data: {
        ...data,
        createdById: createdById,
        problemTestcase: problemTestcases,
        problemTag: {
          create: tagsId
        },
        groupId: groupId
      }
    })
  }

  async getGroupProblems(
    groupId: number,
    cursor: number,
    take: number,
    input: GetGroupProblemsInput
  ) {
    const whereOptions: ProblemWhereInput = {}

    if (!input.difficulty) {
      whereOptions.difficulty = {
        in: input.difficulty
      }
    }

    if (!input.languages) {
      whereOptions.languages = { hasSome: input.languages }
    }

    return await this.prisma.problem.findMany({
      where: {
        ...whereOptions,
        groupId: groupId
      },
      cursor: {
        id: cursor < 1 ? 1 : cursor
      },
      skip: cursor < 1 ? 0 : 1,
      take: take
    })
  }

  async getGroupProblem(groupId: number, input: number) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id: input,
        groupId: groupId
      }
    })
    return problem
  }

  async updateGroupProblem(groupId: number, input: UpdateProblemInput) {
    const { id, ...data } = input

    await this.getGroupProblem(groupId, id)

    return await this.prisma.problem.update({
      where: {
        id: id
      },
      data: {
        ...data
      }
    })
  }

  async deleteGroupProblem(groupId: number, input: number) {
    await this.getGroupProblem(groupId, input)
    return await this.prisma.problem.delete({
      where: {
        id: input
      }
    })
  }
}
