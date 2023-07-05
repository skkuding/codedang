import { Injectable } from '@nestjs/common'
import { isDefined } from 'class-validator'
import { PrismaService } from '@libs/prisma'
import type { ProblemWhereInput } from '@admin/@generated/problem/problem-where.input'
import type { CreateGroupProblemDto } from './dto/create-problem.dto'
import type {
  DeleteGroupProblemDto,
  GetGroupProblemDto,
  GetGroupProblemsDto
} from './dto/request-problem.dto'
import type { UpdateProblemDto } from './dto/update-problem.dto'

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createdById: number, problemCreateInput: CreateGroupProblemDto) {
    const problemTestcase = {
      create: problemCreateInput.testcase
    }

    const tagsId = problemCreateInput.tag.map((value) => {
      return {
        tagId: value
      }
    })

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      testcase: _4,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      tag: _5,
      ..._data
    } = problemCreateInput

    return await this.prisma.problem.create({
      data: {
        ..._data,
        createdById: createdById,
        problemTestcase: problemTestcase,
        problemTag: {
          create: tagsId
        }
      }
    })
  }

  async getAll(getGroupProblemsInput: GetGroupProblemsDto) {
    const whereOptions: ProblemWhereInput = {
      groupId: { equals: getGroupProblemsInput.groupId }
    }

    if (isDefined(getGroupProblemsInput.createdById)) {
      whereOptions.createdById = { equals: getGroupProblemsInput.createdById }
    }

    if (isDefined(getGroupProblemsInput.difficulty)) {
      whereOptions.difficulty = {
        equals: getGroupProblemsInput.difficulty
      }
    }

    if (isDefined(getGroupProblemsInput.languages)) {
      whereOptions.languages = { hasSome: getGroupProblemsInput.languages }
    }

    return await this.prisma.problem.findMany({
      where: {
        ...whereOptions
      },
      cursor: {
        id: getGroupProblemsInput.cursor < 1 ? 1 : getGroupProblemsInput.cursor
      },
      skip: getGroupProblemsInput.cursor < 1 ? 0 : 1,
      take: getGroupProblemsInput.take
    })
  }

  async getOne(getGroupProblemInput: GetGroupProblemDto) {
    return await this.prisma.problem.findUniqueOrThrow({
      where: {
        id: getGroupProblemInput.problemId
      }
    })
  }

  async update(updateProblemInput: UpdateProblemDto) {
    const { problemId, ..._data } = updateProblemInput

    return await this.prisma.problem.update({
      where: {
        id: problemId
      },
      data: {
        ..._data
      }
    })
  }

  async delete(deleteGroupProblemInput: DeleteGroupProblemDto) {
    return await this.prisma.problem.delete({
      where: {
        id: deleteGroupProblemInput.problemId
      }
    })
  }
}
