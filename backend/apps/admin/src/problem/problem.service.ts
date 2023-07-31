import { Injectable } from '@nestjs/common'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { ProblemWhereInput } from '@admin/@generated/problem/problem-where.input'
import { StorageService } from '@admin/storage/storage.service'
import type { CreateProblemInput } from './model/create-problem.input'
import type { FilterProblemsInput } from './model/filter-problem.input'
import type { Testcase } from './model/testcase.input'
import type { UpdateProblemInput } from './model/update-problem.input'

@Injectable()
export class ProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  async createProblem(
    input: CreateProblemInput,
    userId: number,
    groupId: number
  ) {
    const { languages, template, tagIds, testcases, ...data } = input
    if (!languages.length) {
      throw new UnprocessableDataException(
        'A problem should support at least one language'
      )
    }
    template.forEach((template) => {
      if (!languages.includes(template.language)) {
        throw new UnprocessableDataException(
          `This problem does not support ${template.language}`
        )
      }
    })

    const problem = await this.prisma.problem.create({
      data: {
        ...data,
        groupId: groupId,
        createdById: userId,
        languages,
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

  // TODO: 테스트케이스별로 파일 따로 업로드 -> 수정 시 updateTestcases, deleteProblem 로직 함께 정리
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

  async getProblems(
    input: FilterProblemsInput,
    groupId: number,
    cursor: number,
    take: number
  ) {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }

    const whereOptions: ProblemWhereInput = {}
    if (input.difficulty) {
      whereOptions.difficulty = {
        in: input.difficulty
      }
    }
    if (input.languages) {
      whereOptions.languages = { hasSome: input.languages }
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

  async getProblem(id: number, groupId: number) {
    return await this.prisma.problem.findFirstOrThrow({
      where: {
        id,
        groupId
      },
      include: {
        problemTestcase: true,
        problemTag: {
          include: {
            tag: true
          }
        }
      }
    })
  }

  async updateProblem(input: UpdateProblemInput, groupId: number) {
    const { id, languages, template, tagIds, testcases, ...data } = input
    const problem = await this.getProblem(id, groupId)

    if (languages && !languages.length) {
      throw new UnprocessableDataException(
        'A problem should support at least one language'
      )
    }
    const supportedLangs = languages ?? problem.languages
    template?.forEach((template) => {
      if (!supportedLangs.includes(template.language)) {
        throw new UnprocessableDataException(
          `This problem does not support ${template.language}`
        )
      }
    })

    // FIXME: handle tags
    if (testcases?.length) await this.updateTestcases(id, testcases)

    return await this.prisma.problem.update({
      where: { id },
      data: {
        ...data,
        ...(template !== undefined && { template: JSON.stringify(template) })
      }
    })
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
      const uploaded: Array<Testcase & { id: number }> = JSON.parse(
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

            const i = uploaded.findIndex((record) => record.id === tc.id)
            uploaded[i] = {
              id: tc.id,
              input: tc.output,
              output: tc.output
            }
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

  async deleteProblem(id: number, groupId: number) {
    await this.getProblem(id, groupId)
    await this.storageService.deleteObject(`${id}.json`)

    return await this.prisma.problem.delete({
      where: { id }
    })
  }
}
