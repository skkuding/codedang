import { PrismaService } from '@libs/prisma'
import { Injectable } from '@nestjs/common'
import { Workbook } from 'exceljs'
import { type FileUploadInput } from './model/file-upload.input'
import { type Prisma } from '@prisma/client'
import { Language } from '@admin/@generated/prisma/language.enum'
import { Level } from '@admin/@generated/prisma/level.enum'
import { type ProblemCreateManyInput } from '@admin/@generated/problem/problem-create-many.input'
import { ActionNotAllowedException } from '@client/common/exception/business.exception'

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

  async problemImport(
    userId: number,
    groupId: number,
    input: FileUploadInput
  ): Promise<Prisma.BatchPayload> {
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
    const problems: ProblemCreateManyInput[] = []
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
          templateCode,
          readonly: false
        })
        languages.push(language)
      }
      //TODO: specify timeLimit, memoryLimit(default: 2sec, 512mb)

      problems.push({
        createdById: userId,
        groupId,
        title,
        description,
        inputDescription: '',
        outputDescription: '',
        hint: '',
        languages,
        timeLimit: 2000,
        memoryLimit: 512,
        difficulty: level,
        source: ''
      })

      //TODO: implement testCaseUpload
      const testCnt = parseInt(row.getCell(goormHeader['TestCnt']).text)
      const input = row.getCell(goormHeader['Input']).text.split('::')
      const output = row.getCell(goormHeader['Output']).text.split('::')
      const scoreWeight = row.getCell(goormHeader['Score']).text.split('::')

      if (input.length !== testCnt || output.length !== testCnt)
        throw new ActionNotAllowedException(
          'Testcase includes ::',
          'problem import function'
        )
    })

    return await this.prisma.problem.createMany({
      data: problems,
      skipDuplicates: true
    })
  }
}
