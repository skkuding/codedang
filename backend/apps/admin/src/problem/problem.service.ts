import { BadRequestException, HttpException, Injectable } from '@nestjs/common'
import { PrismaService } from '@client/prisma/prisma.service'
import { type CreateGroupProblemDto } from './dto/create-problem.dto'
import { Level } from '@admin/@generated/prisma/level.enum'
import type { UserCreateNestedOneWithoutProblemInput } from '@admin/@generated/user/user-create-nested-one-without-problem.input'
import type { GroupCreateNestedOneWithoutProblemInput } from '@admin/@generated/group/group-create-nested-one-without-problem.input'
import { type UpdateProblem } from './dto/update-problem.dto'
import { isDefined } from 'class-validator'
import type { ProblemTestcaseUncheckedCreateNestedManyWithoutProblemInput } from '@admin/@generated/problem-testcase/problem-testcase-unchecked-create-nested-many-without-problem.input'
import type { TagCreateManyInput } from '@admin/@generated/tag/tag-create-many.input'
import type { ProblemTagUncheckedCreateWithoutProblemInput } from '@admin/@generated/problem-tag/problem-tag-unchecked-create-without-problem.input'
import type {
  DeleteGroupProblemDto,
  GetGroupProblemDto,
  GetGroupProblemsDto
} from './dto/request-problem.dto'
import type { ProblemWhereInput } from '@admin/@generated/problem/problem-where.input'

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

  async create(problemCreateInput: CreateGroupProblemDto) {
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

    let tagsId: Array<ProblemTagUncheckedCreateWithoutProblemInput>
    if (isDefined(problemCreateInput.problemTag)) {
      const parsedTag = problemCreateInput.problemTag.map(
        (value): TagCreateManyInput => {
          return {
            name: value
          }
        }
      )
      await this.prisma.tag.createMany({
        data: parsedTag,
        skipDuplicates: true
      })
      const _tagsId = await this.prisma.tag.findMany({
        select: { id: true },
        where: {
          OR: parsedTag
        }
      })
      tagsId = _tagsId.map((value) => {
        return {
          tagId: value.id
        }
      })
    }

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      groupId: _1,
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
        createdBy: createdBy,
        problemTestcase: problemTestcase,
        problemTag: {
          create: tagsId
        }
      }
    })
  }

  async findAll(getGroupProblemsInput: GetGroupProblemsDto) {
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
      select: this.problemsSelectOption,
      cursor: { id: getGroupProblemsInput.cursor },
      skip: 1,
      take: getGroupProblemsInput.take
    })
  }

  async findOne(getGroupProblemInput: GetGroupProblemDto) {
    try {
      return await this.prisma.problem.findUniqueOrThrow({
        where: {
          id: getGroupProblemInput.problemId
        },
        select: this.problemSelectOption
      })
    } catch {
      throw new HttpException('no such problem', 404)
    }
  }

  async update(updateProblemInput: UpdateProblem) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { problemId: _a, difficulty: _b, ..._data } = updateProblemInput

    const problemId: number = updateProblemInput.problemId

    let difficulty: Level
    if (isDefined(updateProblemInput.difficulty)) {
      difficulty = Level[updateProblemInput.difficulty]
    }

    const data = await this.prisma.problem.update({
      where: {
        id: problemId
      },
      data: {
        ..._data,
        difficulty: difficulty
      }
    })

    if (!data) {
      throw new BadRequestException('no user with such sutdentId')
    }

    return data
  }

  async remove(deleteGroupProblemInput: DeleteGroupProblemDto) {
    try {
      await this.prisma.problem.findUniqueOrThrow({
        where: {
          id: deleteGroupProblemInput.problemId
        },
        select: this.problemSelectOption
      })

      return await this.prisma.problem.delete({
        where: {
          id: deleteGroupProblemInput.problemId
        }
      })
    } catch {
      throw new HttpException('no such problem', 404)
    }
  }
}
