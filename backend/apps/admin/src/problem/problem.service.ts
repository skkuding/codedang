import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { ProblemWhereInput } from '@admin/@generated/problem/problem-where.input'
import { StorageService } from '@admin/storage/storage.service'
import type { CreateProblemInput } from './model/create-problem.input'
import type { GetProblemsInput } from './model/request-problem.input'
import type { Testcase } from './model/testcase.input'
import type { UpdateProblemInput } from './model/update-problem.input'

@Injectable()
export class ProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  async createGroupProblem(
    userId: number,
    groupId: number,
    input: CreateProblemInput
  ) {
    const { template, testcases, tagIds, ...data } = input
    const problem = await this.prisma.problem.create({
      data: {
        ...data,
        groupId: groupId,
        createdById: userId,
        template: JSON.stringify(template),
        problemTag: {
          create: tagIds.map((tagId) => {
            return { tagId }
          })
        }
      }
    })
    await this.createTestcases(problem.id, testcases)
    return problem
  }

  // TODO: 테스트케이스별로 파일 따로 업로드 -> 수정 시 updateTestcases 로직 함께 정리
  async createTestcases(problemId: number, testcases: Array<Testcase>) {
    const filename = `${problemId}.json`
    const testcaseIds = await Promise.all(
      testcases.map(async (tc, index) => {
        const problemTestcase = await this.prisma.problemTestcase.create({
          data: {
            problemId,
            input: filename,
            output: filename,
            scoreWeight: tc.scoreWeight
          }
        })
        return { index, id: problemTestcase.id }
      })
    )

    const data = JSON.stringify(
      testcases.map((tc, index) => {
        return {
          id: testcaseIds.find((record) => record.index === index),
          input: tc.input,
          output: tc.output
        }
      })
    )
    await this.storageService.uploadObject(filename, data, 'json')
  }

  async getGroupProblems(
    groupId: number,
    cursor: number,
    take: number,
    input: GetProblemsInput
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
    const { id, template, testcases, tagIds, ...data } = input
    await this.getGroupProblem(groupId, id)

    return await this.prisma.problem.update({
      where: { id },
      data: {
        ...data,
        ...(template !== undefined && { template: JSON.stringify(template) })
      }
    })
    // TODO: handle testcases & tags
  }

  async updateTestcases(
    problemId: number,
    testcases: Array<Testcase & { id: number }>
  ) {
    const deletedIds = [],
      createdOrUpdated = []

    for (const tc of testcases) {
      if (!tc.input && !tc.output) {
        deletedIds.push(tc.id)
      }
      createdOrUpdated.push(tc)
    }
    if (deletedIds) {
      await this.prisma.problemTestcase.deleteMany({
        where: {
          id: { in: deletedIds }
        }
      })
    }
    if (createdOrUpdated) {
      const filename = `${problemId}.json`
      const uploaded = JSON.parse(
        await this.storageService.readObject(filename)
      )

      const updatedIds = (
        await this.prisma.problemTestcase.findMany({
          where: {
            id: { in: createdOrUpdated.map((tc) => tc.id) }
          }
        })
      ).map((tc) => tc.id)
      await Promise.all(
        createdOrUpdated
          .filter((tc) => !updatedIds.includes(tc.id))
          .map(async (tc) => {
            await this.prisma.problemTestcase.update({
              where: {
                id: tc.id
              },
              data: {
                scoreWeight: tc.scoreWeight
              }
            })
          })
      )

      await Promise.all(
        createdOrUpdated
          .filter((tc) => !updatedIds.includes(tc.id))
          .map(async (tc) => {
            const problemTestcase = await this.prisma.problemTestcase.create({
              data: {
                problemId,
                input: filename,
                output: filename,
                scoreWeight: tc.scoreWeight
              }
            })
            uploaded.push({
              id: problemTestcase.id,
              input: tc.input,
              output: tc.output
            })
          })
      )

      const data = JSON.stringify(uploaded)
      await this.storageService.uploadObject(filename, data, 'json')
    }
  }

  async deleteGroupProblem(groupId: number, input: number) {
    await this.getGroupProblem(groupId, input)
    return await this.prisma.problem.delete({
      where: {
        id: input
      }
    })
    // TODO: 테스트케이스 삭제
  }
}
