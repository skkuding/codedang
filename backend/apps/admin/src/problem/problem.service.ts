import { Injectable } from '@nestjs/common'
import { Workbook } from 'exceljs'
import {
  UnprocessableDataException,
  UnprocessableFileException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { Language } from '@admin/@generated/prisma/language.enum'
import { Level } from '@admin/@generated/prisma/level.enum'
import type { ProblemWhereInput } from '@admin/@generated/problem/problem-where.input'
import { StorageService } from '@admin/storage/storage.service'
import { ImportedProblemHeader } from './model/problem.constants'
import type {
  CreateProblemInput,
  UploadFileInput,
  FilterProblemsInput,
  UploadProblemInput
} from './model/problem.input'
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
    const problems: { index: number; data: UploadProblemInput }[] = []
    const testcases: { [key: number]: Testcase[] } = {}

    const workbook = new Workbook()
    const worksheet = (await workbook.xlsx.read(createReadStream()))
      .worksheets[0]

    worksheet.getRow(1).eachCell((cell, idx) => {
      if (!ImportedProblemHeader.includes(cell.text))
        throw new UnprocessableFileException(
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
          throw new UnprocessableFileException(
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
      const template = []

      for (let language of languagesText) {
        let code: string
        switch (language) {
          case 'Python':
            language = 'Python3'
            break
          default:
            if (!(language in Language)) continue
            code = row.getCell(header[`${language}SampleCode`]).text
        }
        if (code) {
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
        }
        languages.push(Language[language])
      }
      if (!languages.length) {
        throw new UnprocessableFileException(
          'A problem should support at least one language',
          filename,
          rowNumber + 1
        )
      }

      //TODO: specify timeLimit, memoryLimit(default: 2sec, 512mb)
      const problemInput = {
        title,
        description,
        inputDescription: '',
        outputDescription: '',
        hint: '',
        template: template,
        languages,
        timeLimit: 2000,
        memoryLimit: 512,
        difficulty: level,
        source: '',
        inputExamples: [],
        outputExamples: []
      }
      problems.push({ index: rowNumber, data: problemInput })

      const testCnt = parseInt(row.getCell(header['TestCnt']).text)
      const inputText = row.getCell(header['Input']).text
      const outputs = row.getCell(header['Output']).text.split('::')
      const scoreWeights = row.getCell(header['Score']).text.split('::')

      if (testCnt === 0) return

      let inputs: string[]
      if (inputText === '' && testCnt !== 0) {
        for (let i = 0; i < testCnt; i++) inputs.push('')
      } else {
        inputs = inputText.split('::')
      }

      if (
        (inputs.length !== testCnt || outputs.length !== testCnt) &&
        inputText != ''
      ) {
        throw new UnprocessableFileException(
          'TestCnt must match the length of Input and Output. Or Testcases should not include ::.',
          filename,
          rowNumber + 1
        )
      }

      const testcaseInput = []
      for (let i = 0; i < testCnt; i++) {
        testcaseInput.push({
          input: inputs[i],
          output: outputs[i],
          scoreWeight: parseInt(scoreWeights[i])
        })
      }
      testcases[rowNumber] = testcaseInput
    })

    return await Promise.all(
      problems.map(async (problemInput) => {
        const { index, data } = problemInput
        const problem = await this.prisma.problem.create({
          data: {
            ...data,
            createdBy: {
              connect: {
                id: userId
              }
            },
            group: {
              connect: {
                id: groupId
              }
            },
            template: [JSON.stringify(data.template)]
          }
        })
        if (index in testcases) {
          await this.createTestcases(problem.id, testcases[index])
        }
        return problem
      })
    )
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // FIXME: handle tags -> remove eslint-disable after fix
    if (testcases?.length) await this.updateTestcases(id, testcases)

    return await this.prisma.problem.update({
      where: { id },
      data: {
        ...data,
        ...(languages && { languages: languages }),
        ...(template && { template: [JSON.stringify(template)] })
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
