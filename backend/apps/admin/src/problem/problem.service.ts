import { Injectable } from '@nestjs/common'
import { PrismaService } from '@client/prisma/prisma.service'
import type { ProblemWhereUniqueInput } from '@admin/@generated/problem/problem-where-unique.input'
import type { ProblemUpdateInput } from '@admin/@generated/problem/problem-update.input'
import type { ProblemCreateInput } from '@admin/@generated/problem/problem-create.input'

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

  async create(problemCreateInput: ProblemCreateInput) {
    //preCheck = await this.prisma.problem.create
    //check whether already existing or not

    return await this.prisma.problem.create({
      data: problemCreateInput
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

  async update(
    problemWhereUniqueInput: ProblemWhereUniqueInput,
    problemUpdateInput: ProblemUpdateInput
  ) {
    return await this.prisma.problem.update({
      where: problemWhereUniqueInput,
      data: problemUpdateInput
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
