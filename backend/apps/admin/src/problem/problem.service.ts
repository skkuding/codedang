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
    const { problemTag, problemTestcase, ...data } = input

    const problemTestcases = {
      create: problemTestcase
    }

    const tagsId = problemTag.map((value) => {
      return {
        tagId: value
      }
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-nocheck
    return await this.prisma.problem.create({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-nocheck
      data: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-nocheck
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

    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }

    return await this.prisma.problem.findMany({
      where: {
        ...whereOptions,
        groupId: groupId
      },
      cursor: {
        id: cursor
      },
      skip: skip,
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-nocheck
    const { id, ...data } = input

    await this.getGroupProblem(groupId, id)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-nocheck
    return await this.prisma.problem.update(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-nocheck
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-nocheck
        where: {
          id: id
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-nocheck
        data: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-nocheck
          ...data
        }
      }
    )
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
