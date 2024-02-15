import { Injectable } from '@nestjs/common'
import { Language } from '@generated'
import type { ContestProblem, WorkbookProblem } from '@generated'
import { Level } from '@generated'
import type { ProblemWhereInput } from '@generated'
import { Workbook } from 'exceljs'
import {
  DuplicateFoundException,
  UnprocessableDataException,
  UnprocessableFileDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@admin/storage/storage.service'
import { ImportedProblemHeader } from './model/problem.constants'
import type {
  CreateProblemInput,
  UploadFileInput,
  FilterProblemsInput,
  UpdateProblemInput,
  UpdateProblemTagInput
} from './model/problem.input'
import type { Template } from './model/template.input'
import type { Testcase } from './model/testcase.input'

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
    const { languages, template, tagIds, samples, testcases, ...data } = input
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
        samples: {
          create: samples
        },
        groupId,
        createdById: userId,
        languages,
        template: [JSON.stringify(template)],
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

    //TODO: iris testcaseId return 문제가 해결되면 밑 코드 없앨 예정
    const data = JSON.stringify(
      testcases.map((tc, index) => {
        const testcaseId = testcaseIds.find((record) => record.index === index)
        return {
          id: `${problemId}:${testcaseId!.id}`,
          input: tc.input,
          output: tc.output
        }
      })
    )
    await this.storageService.uploadObject(filename, data, 'json')
  }

  async uploadProblems(
    input: UploadFileInput,
    userId: number,
    groupId: number
  ) {
    const { filename, mimetype, createReadStream } = await input.file
    if (
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ].includes(mimetype) === false
    )
      throw new UnprocessableDataException(
        'Extensions except Excel(.xlsx, .xls) are not supported.'
      )

    const header = {}
    const problems: CreateProblemInput[] = []
    // const testcases: { [key: number]: Testcase[] } = {}

    const workbook = new Workbook()
    const worksheet = (await workbook.xlsx.read(createReadStream()))
      .worksheets[0]

    worksheet.getRow(1).eachCell((cell, idx) => {
      if (!ImportedProblemHeader.includes(cell.text))
        throw new UnprocessableFileDataException(
          `Field ${cell.text} is not supported`,
          filename,
          1
        )
      header[cell.text] = idx
    })
    worksheet.spliceRows(1, 1)

    const unsupportedFields = [
      header['InputFileName'],
      header['InputFilePath'],
      header['OutputFileName'],
      header['OutputFilePath']
    ]
    worksheet.eachRow(async function (row, rowNumber) {
      for (const colNumber of unsupportedFields) {
        if (row.getCell(colNumber).text !== '')
          throw new UnprocessableFileDataException(
            'Using inputFile, outputFile is not supported',
            filename,
            rowNumber + 1
          )
      }
      const title = row.getCell(header['문제제목']).text
      const description = row.getCell(header['문제내용']).text
      const languagesText = row.getCell(header['지원언어']).text.split(',')
      const levelText = row.getCell(header['난이도']).text
      const languages: Language[] = []
      const level: Level = Level['Level' + levelText]
      const template: Template[] = []

      for (let text of languagesText) {
        if (text === 'Python') {
          text = 'Python3'
        }

        if (!(text in Language)) continue

        const language = text as keyof typeof Language
        const code = row.getCell(header[`${language}SampleCode`]).text

        template.push({
          language,
          code: [
            {
              id: 1,
              text: code,
              locked: false
            }
          ]
        })
        languages.push(Language[language])
      }

      if (!languages.length) {
        throw new UnprocessableFileDataException(
          'A problem should support at least one language',
          filename,
          rowNumber + 1
        )
      }

      //TODO: specify timeLimit, memoryLimit(default: 2sec, 512mb)

      const testCnt = parseInt(row.getCell(header['TestCnt']).text)
      const inputText = row.getCell(header['Input']).text
      const outputs = row.getCell(header['Output']).text.split('::')
      const scoreWeights = row.getCell(header['Score']).text.split('::')

      if (testCnt === 0) return

      let inputs: string[] = []
      if (inputText === '' && testCnt !== 0) {
        for (let i = 0; i < testCnt; i++) inputs.push('')
      } else {
        inputs = inputText.split('::')
      }

      if (
        (inputs.length !== testCnt || outputs.length !== testCnt) &&
        inputText != ''
      ) {
        throw new UnprocessableFileDataException(
          'TestCnt must match the length of Input and Output. Or Testcases should not include ::.',
          filename,
          rowNumber + 1
        )
      }

      const testcaseInput: Testcase[] = []
      for (let i = 0; i < testCnt; i++) {
        testcaseInput.push({
          input: inputs[i],
          output: outputs[i],
          scoreWeight: parseInt(scoreWeights[i])
        })
      }

      problems.push({
        title,
        description,
        inputDescription: '',
        outputDescription: '',
        hint: '',
        template,
        languages,
        timeLimit: 2000,
        memoryLimit: 512,
        difficulty: level,
        source: '',
        testcases: testcaseInput,
        tagIds: [],
        samples: []
      })
    })

    return await Promise.all(
      problems.map(async (data) => {
        const problem = await this.createProblem(data, userId, groupId)
        return problem
      })
    )
  }

  async getProblems(
    input: FilterProblemsInput,
    groupId: number,
    cursor: number | null,
    take: number
  ) {
    const paginator = this.prisma.getPaginator(cursor)

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
      ...paginator,
      where: {
        ...whereOptions,
        groupId
      },
      take
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
    const { id, languages, template, tags, testcases, samples, ...data } = input
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

    const problemTag = tags ? await this.updateProblemTag(id, tags) : undefined

    if (testcases?.length) {
      await this.updateTestcases(id, testcases)
    }

    return await this.prisma.problem.update({
      where: { id },
      data: {
        ...data,
        samples: {
          create: samples?.create,
          delete: samples?.delete.map((deleteId) => {
            return {
              id: deleteId
            }
          })
        },
        ...(languages && { languages }),
        ...(template && { template: [JSON.stringify(template)] }),
        problemTag
      }
    })
  }

  async updateProblemTag(
    problemId: number,
    problemTags: UpdateProblemTagInput
  ) {
    const createIds = problemTags.create.map(async (tagId) => {
      const check = await this.prisma.problemTag.findFirst({
        where: {
          tagId,
          problemId
        }
      })
      if (check) {
        throw new DuplicateFoundException(`${tagId} tag`)
      }
      return { tag: { connect: { id: tagId } } }
    })

    const deleteIds = problemTags.delete.map(async (tagId) => {
      const check = await this.prisma.problemTag.findFirstOrThrow({
        where: {
          tagId,
          problemId
        },
        select: { id: true }
      })
      return { id: check.id }
    })

    return await {
      create: await Promise.all(createIds),
      delete: await Promise.all(deleteIds)
    }
  }

  async updateTestcases(
    problemId: number,
    testcases: Array<Testcase & { id: number }>
  ) {
    const deletedIds: number[] = []
    const createdOrUpdated: typeof testcases = []

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

    const result = await this.prisma.problem.delete({
      where: { id }
    })
    await this.storageService.deleteObject(`${id}.json`)

    return result
  }

  async getWorkbookProblems(
    groupId: number,
    workbookId: number
  ): Promise<Partial<WorkbookProblem>[]> {
    // id를 받은 workbook이 현재 접속된 group의 것인지 확인
    // 아니면 에러 throw
    await this.prisma.workbook.findFirstOrThrow({
      where: { id: workbookId, groupId }
    })
    const workbookProblems = await this.prisma.workbookProblem.findMany({
      where: { workbookId }
    })

    return workbookProblems
  }

  async updateWorkbookProblemsOrder(
    groupId: number,
    workbookId: number,
    // orders는 항상 workbookId에 해당하는 workbookProblems들이 모두 딸려 온다.
    orders: number[]
  ): Promise<Partial<WorkbookProblem>[]> {
    // id를 받은 workbook이 현재 접속된 group의 것인지 확인
    await this.prisma.workbook.findFirstOrThrow({
      where: { id: workbookId, groupId }
    })
    // workbookId를 가지고 있는 workbookProblem을 모두 가져옴
    const workbookProblemsToBeUpdated =
      await this.prisma.workbookProblem.findMany({
        where: { workbookId }
      })
    // orders 길이와  찾은 workbookProblem 길이가 같은지 확인
    if (orders.length !== workbookProblemsToBeUpdated.length) {
      throw new UnprocessableDataException(
        'the len of orders and the len of workbookProblem are not equal.'
      )
    }
    //problemId 기준으로 오름차순 정렬
    workbookProblemsToBeUpdated.sort((a, b) => a.problemId - b.problemId)
    const queries = workbookProblemsToBeUpdated.map((record) => {
      const newOrder = orders.indexOf(record.problemId) + 1
      return this.prisma.workbookProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          workbookId_problemId: {
            workbookId,
            problemId: record.problemId
          }
        },
        data: { order: newOrder }
      })
    })
    return await this.prisma.$transaction(queries)
  }

  async getContestProblems(
    groupId: number,
    contestId: number
  ): Promise<Partial<ContestProblem>[]> {
    await this.prisma.contest.findFirstOrThrow({
      where: { id: contestId, groupId }
    })
    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId }
    })
    return contestProblems
  }

  async updateContestProblemsOrder(
    groupId: number,
    contestId: number,
    orders: number[]
  ): Promise<Partial<ContestProblem>[]> {
    await this.prisma.contest.findFirstOrThrow({
      where: { id: contestId, groupId }
    })

    const contestProblemsToBeUpdated =
      await this.prisma.contestProblem.findMany({
        where: { contestId }
      })

    if (orders.length !== contestProblemsToBeUpdated.length) {
      throw new UnprocessableDataException(
        'the len of orders and the len of contestProblem are not equal.'
      )
    }
    //problemId 기준으로 오름차순 정렬
    contestProblemsToBeUpdated.sort((a, b) => a.problemId - b.problemId)
    const queries = contestProblemsToBeUpdated.map((record) => {
      const newOrder = orders.indexOf(record.problemId) + 1
      return this.prisma.contestProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_problemId: {
            contestId,
            problemId: record.problemId
          }
        },
        data: { order: newOrder }
      })
    })

    return await this.prisma.$transaction(queries)
  }
}
