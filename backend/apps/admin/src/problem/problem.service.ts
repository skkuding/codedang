import { Injectable } from '@nestjs/common'
import { PrismaService } from '@client/prisma/prisma.service'
import { type CreateProblem } from './dto/create-problem.dto'
import { Level } from '@admin/@generated/prisma/level.enum'
import type { UserCreateNestedOneWithoutProblemInput } from '@admin/@generated/user/user-create-nested-one-without-problem.input'
import type { GroupCreateNestedOneWithoutProblemInput } from '@admin/@generated/group/group-create-nested-one-without-problem.input'
import { type UpdateProblem } from './dto/update-problem.dto'
import { isDefined } from 'class-validator'
import type { ProblemTestcaseUncheckedCreateNestedManyWithoutProblemInput } from '@admin/@generated/problem-testcase/problem-testcase-unchecked-create-nested-many-without-problem.input'
import type { ProblemTagUncheckedCreateNestedManyWithoutProblemInput } from '@admin/@generated/problem-tag/problem-tag-unchecked-create-nested-many-without-problem.input'
import type { ProblemTagCreateWithoutProblemInput } from '@admin/@generated/problem-tag/problem-tag-create-without-problem.input'

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly problemsSelectOption = {
    id: true,
    title: true,
    difficulty: true
  }

  private readonly problemSelectOption = {
    ...this.problemsSelectOption,
    description: true,
    inputDescription: true,
    outputDescription: true,
    hint: true,
    languages: true,
    timeLimit: true,
    memoryLimit: true,
    source: true,
    inputExamples: true,
    outputExamples: true
  }

  async create(problemCreateInput: CreateProblem) {
    let difficulty: Level = Level.Level1
    if (problemCreateInput.difficulty == 'Level2') difficulty = Level.Level2
    else difficulty = Level.Level3

    const createdBy: UserCreateNestedOneWithoutProblemInput = {
      connect: {
        id: problemCreateInput.createdById
      }
    }

    const group: GroupCreateNestedOneWithoutProblemInput = {
      connect: {
        id: problemCreateInput.groupId
      }
    }

    const problemTestcase: ProblemTestcaseUncheckedCreateNestedManyWithoutProblemInput =
      {
        create: problemCreateInput.problemTestcase
      }

    let problemTag: ProblemTagUncheckedCreateNestedManyWithoutProblemInput
    if (isDefined(problemCreateInput.problemTag)) {
      problemTag = {
        create: problemCreateInput.problemTag.map(
          (t): ProblemTagCreateWithoutProblemInput => {
            return {
              tag: {
                create: {
                  name: t
                }
              }
            }
          }
        )
      }
    }

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      groupId: _1,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      difficulty: _2,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdById: _3,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      problemTestcase: _4,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      problemTag: _5,
      ..._data
    } = problemCreateInput

    return await this.prisma.problem.create({
      data: {
        ..._data,
        group: group,
        difficulty: difficulty,
        createdBy: createdBy,
        problemTestcase: problemTestcase,
        problemTag: problemTag
      }
    })
  }

  async findAll(groupId: number, cursor: number, take: number) {
    return await this.prisma.problem.findMany({
      where: {
        groupId: groupId
      },
      select: this.problemsSelectOption,
      cursor: { id: cursor },
      skip: 1,
      take: take
    })
  }

  async findOne(id: number) {
    return await this.prisma.problem.findUnique({
      where: {
        id: id
      },
      select: this.problemSelectOption
    })
  }

  async update(updateProblemInput: UpdateProblem) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { problemId: _a, difficulty: _b, ..._data } = updateProblemInput

    const problemId: number = updateProblemInput.problemId

    let difficulty: Level
    if (isDefined(updateProblemInput.difficulty)) {
      difficulty = Level[updateProblemInput.difficulty]
    }

    return await this.prisma.problem.update({
      where: {
        id: problemId
      },
      data: {
        ..._data,
        difficulty: difficulty
      }
    })
  }

  async remove(problemId: number) {
    return await this.prisma.problem.delete({
      where: {
        id: problemId //here
      }
    })
  }
}
