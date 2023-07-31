import { Inject, Injectable } from '@nestjs/common'
import { Workbook } from 'exceljs'
import {
  InvalidFileFormatException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { ProblemTestcaseCreateManyInput } from '@admin/@generated'
import { Language } from '@admin/@generated/prisma/language.enum'
import { Level } from '@admin/@generated/prisma/level.enum'
import type { ProblemCreateInput } from '@admin/@generated/problem/problem-create.input'
import type { ProblemWhereInput } from '@admin/@generated/problem/problem-where.input'
import { StorageService } from '@admin/storage/storage.service'
import type { CreateProblemInput } from './model/create-problem.input'
import type { FilterProblemsInput } from './model/filter-problem.input'
import { GoormHeader } from './model/problem.constants'
import type { FileUploadInput } from './model/problem.input'
import type { Testcase } from './model/testcase.input'
import type { UpdateProblemInput } from './model/update-problem.input'

@Injectable()
export class ProblemService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(StorageService) private readonly storageService: StorageService
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

  async importProblems(
    userId: number,
    groupId: number,
    input: FileUploadInput
  ) {
    const { filename, mimetype, createReadStream } = await input.file
    if (
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ].includes(mimetype) === false
    )
      throw new UnprocessableDataException(
        'Files except Excel(.xlsx, .xls) are not supported.'
      )

    const workbook = new Workbook()
    const worksheet = (await workbook.xlsx.read(createReadStream()))
      .worksheets[0]
    const problems: ProblemCreateInput[] = []
    const goormHeader = {}
    const ProblemTestcases = {}

    worksheet.eachRow(async function (row, rowNumber) {
      if (rowNumber === 1) {
        row.eachCell((cell, idx) => {
          if (!GoormHeader.includes(cell.text))
            throw new InvalidFileFormatException(
              'Only goorm export files are supported',
              filename,
              rowNumber
            )
          goormHeader[cell.text] = idx
        })
        return
      }

      for (const colNumber of [
        goormHeader['InputFileName'],
        goormHeader['InputFilePath'],
        goormHeader['OutputFileName'],
        goormHeader['OutputFilePath']
      ]) {
        if (row.getCell(colNumber).text !== '')
          throw new InvalidFileFormatException(
            'Using inputFile, outputFile is not supported',
            filename,
            rowNumber
          )
      }

      const title = row.getCell(goormHeader['문제제목']).text
      const description = row.getCell(goormHeader['문제내용']).text
      const languagesText = row.getCell(goormHeader['지원언어']).text.split(',')
      const levelText = row.getCell(goormHeader['난이도']).text
      const templateCodes = []
      const languages: Language[] = []
      const level: Level = Level['Level' + levelText]

      for (const idx in languagesText) {
        let templateCode: string
        let language: Language

        switch (languagesText[idx]) {
          case 'C':
            language = Language.C
            templateCode = row.getCell(goormHeader['CSampleCode']).text
            break
          case 'Cpp':
            language = Language.Cpp
            templateCode = row.getCell(goormHeader['CppSampleCode']).text
            break
          case 'Java':
            language = Language.Java
            templateCode = row.getCell(goormHeader['JavaSampleCode']).text
            break
          case 'Python':
            language = Language.Python3
            break
        }

        templateCodes.push({
          language,
          code: {
            text: templateCode,
            readonly: false
          }
        })
        languages.push(language)
      }

      //TODO: specify timeLimit, memoryLimit(default: 2sec, 512mb)
      const problem = {
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
        title,
        description,
        inputDescription: '',
        outputDescription: '',
        hint: '',
        template: templateCodes,
        languages,
        timeLimit: 2000,
        memoryLimit: 512,
        difficulty: level,
        source: ''
      }
      problems.push(problem)

      const testCnt = parseInt(row.getCell(goormHeader['TestCnt']).text)
      const inputText = row.getCell(goormHeader['Input']).text
      const output = row.getCell(goormHeader['Output']).text.split('::')
      const scoreWeight = row.getCell(goormHeader['Score']).text.split('::')

      if (testCnt === 0) return

      let input: string[]
      if (inputText === '' && testCnt !== 0) {
        for (let i = 0; i < testCnt; i++) input.push('')
      } else {
        input = inputText.split('::')
      }

      if (
        (input.length !== testCnt || output.length !== testCnt) &&
        inputText != ''
      ) {
        throw new InvalidFileFormatException(
          'TestCount must match the length of Input and Output. Or Testcases should not include ::.',
          filename,
          rowNumber
        )
      }

      ProblemTestcases[(rowNumber - 2).toString()] = {
        testCnt,
        input,
        output,
        scoreWeight
      }
    })

    const results = []
    for (const problemIdx in problems) {
      const result = await this.prisma.problem.create({
        data: problems[problemIdx]
      })
      results.push(result)

      const testcaseIdx = problemIdx.toString()
      if (!(testcaseIdx in ProblemTestcases)) continue

      const testcases = []
      const ProblemTestcase = ProblemTestcases[testcaseIdx]
      for (const idx in ProblemTestcase['input']) {
        testcases.push({
          id: result.id + ':' + idx,
          input: ProblemTestcase['input'][idx],
          output: ProblemTestcase['output'][idx]
        })
      }

      await this.storageService.uploadObject(
        result.id + '.json',
        JSON.stringify(testcases),
        'json'
      )

      const data: ProblemTestcaseCreateManyInput[] = []
      for (const idx in ProblemTestcase['input']) {
        data.push({
          problemId: result.id,
          input: result.id + '.json',
          output: result.id + '.json',
          scoreWeight: parseInt(ProblemTestcase['scoreWeight'][idx])
        })
      }
      await this.prisma.problemTestcase.createMany({ data })
    }
    return results
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
        ...(template && { template: JSON.stringify(template) })
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
