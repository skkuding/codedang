import { Inject, Injectable } from '@nestjs/common'
import { Workbook } from 'exceljs'
import { ActionNotAllowedException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { ProblemTestcaseCreateManyInput } from '@admin/@generated'
import { Language } from '@admin/@generated/prisma/language.enum'
import { Level } from '@admin/@generated/prisma/level.enum'
import type { ProblemCreateInput } from '@admin/@generated/problem/problem-create.input'
import { StorageService } from '@admin/storage/storage.service'
import type { FileUploadInput } from './model/file-upload.input'

@Injectable()
export class ProblemService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(StorageService) private readonly storageService: StorageService
  ) {}

  async problemImport(userId: number, groupId: number, input: FileUploadInput) {
    const { mimetype, createReadStream } = await input.file
    if (
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ].includes(mimetype) === false
    )
      throw new ActionNotAllowedException(
        'Importing files except Excel(.xlsx, .xls)',
        'problem import function'
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
          goormHeader[cell.text] = idx
        })
        return
      }

      for (const idx of [
        goormHeader['InputFileName'],
        goormHeader['InputFilePath'],
        goormHeader['OutputFileName'],
        goormHeader['OutputFilePath']
      ]) {
        if (row.getCell(idx).text !== '')
          throw new ActionNotAllowedException(
            'Using inputFile, outputFile',
            'problem import function'
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

      const testCnt = parseInt(row.getCell(goormHeader['TestCnt']).text)
      const inputText = row.getCell(goormHeader['Input']).text
      const output = row.getCell(goormHeader['Output']).text.split('::')
      const scoreWeight = row.getCell(goormHeader['Score']).text.split('::')

      if (testCnt === 0) {
        problems.push(problem)
        return
      }

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
        throw new ActionNotAllowedException(
          'Testcase including ::',
          'problem import function'
        )
      }

      ProblemTestcases[(rowNumber - 2).toString()] = {
        testCnt,
        input,
        output,
        scoreWeight
      }

      problems.push(problem)
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
}
