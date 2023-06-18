import { Injectable } from '@nestjs/common'
import { PrismaService } from '@client/prisma/prisma.service'
import { type CreateProblem } from './dto/create-problem.dto'
import { Level } from '@admin/@generated/prisma/level.enum'
import type { UserCreateNestedOneWithoutProblemInput } from '@admin/@generated/user/user-create-nested-one-without-problem.input'
import type { GroupCreateNestedOneWithoutProblemInput } from '@admin/@generated/group/group-create-nested-one-without-problem.input'
import { type UpdateProblem } from './dto/update-problem.dto'
import { Language } from '@prisma/client'
import { isDefined } from 'class-validator'

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

    const {
      groupId: _1,
      difficulty: _2,
      createdById: _3,
      ..._data
    } = problemCreateInput

    return await this.prisma.problem.create({
      data: {
        ..._data,
        group: group,
        difficulty: difficulty,
        createdBy: createdBy
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

  mapLanguage(input: string): Language {
    let rvalue: Language = Language.C
    if (input == 'Cpp') rvalue = Language.Cpp
    else if (input == 'Java') rvalue = Language.Java
    else rvalue = Language.Python3

    return rvalue
  }

  async update(updateProblemInput: UpdateProblem) {
    interface LooseObject {
      [key: string]: any
    }

    const {
      problemId: _a,
      difficulty: _b,
      languages: _c,
      ..._data
    }: LooseObject = updateProblemInput

    const problemId: number = updateProblemInput.problemId

    let difficulty: Level = Level.Level1
    if (isDefined(updateProblemInput.difficulty)) {
      if (updateProblemInput.difficulty == 'Level2') difficulty = Level.Level2
      else difficulty = Level.Level3
      _data.difficulty = difficulty
    }

    let languages: Language[] = []
    if (isDefined(updateProblemInput.languages)) {
      languages = updateProblemInput.languages.map((value: string) =>
        this.mapLanguage(value)
      )
      _data.languages = languages
    }

    return await this.prisma.problem.update({
      where: {
        id: problemId
      },
      data: {
        ..._data
      }
    })
  }

  async remove(problemId: number) {
    return await this.prisma.problem.delete({
      where: {
        id: problemId
      }
    })
  }
}
