import { Injectable } from '@nestjs/common'
import { Workbook } from 'exceljs'
import { ActionNotAllowedException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { Language } from '@admin/@generated/prisma/language.enum'
import { Level } from '@admin/@generated/prisma/level.enum'
import type { ProblemCreateInput } from '@admin/@generated/problem/problem-create.input'
import type { FileUploadInput } from './model/file-upload.input'

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

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

    worksheet.eachRow(function (row, rowNumber) {
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

      const testcases = []
      for (const idx in input) {
        testcases.push({
          input: input[idx],
          output: output[idx]
        })
      }

      //TODO: implement testCaseUpload
      const url = 'sample'
      const ProblemTestcases = []
      for (const idx in input) {
        ProblemTestcases.push({
          input: url,
          output: url,
          scoreWeight: parseInt(scoreWeight[idx])
        })
      }

      problems.push({
        ...problem,
        problemTestcase: {
          createMany: {
            data: ProblemTestcases
          }
        }
      })
    })

    const results = []
    for (const idx in problems) {
      results.push(
        await this.prisma.problem.create({
          data: problems[idx]
        })
      )
    }

    return results
  }
}
