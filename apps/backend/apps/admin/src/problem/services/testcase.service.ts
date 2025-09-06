import { ForbiddenException, Injectable } from '@nestjs/common'
import { Prisma, Role } from '@prisma/client'
import { isEqual } from 'es-toolkit'
import { Workbook } from 'exceljs'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { Parse } from 'unzipper'
import { MAX_ZIP_SIZE } from '@libs/constants'
import {
  EntityNotExistException,
  UnprocessableDataException,
  UnprocessableFileDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'
import type { UploadFileInput } from '../model/problem.input'
import { ImportedTestcaseHeader } from '../model/testcase.constants'
import type { Testcase } from '../model/testcase.input'
import { FileService } from './file.service'

@Injectable()
export class TestcaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly storageService: StorageService
  ) {}

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b)
  }

  private convertToFraction(testcase: Testcase): {
    numerator: number
    denominator: number
  } {
    // Frontend provide score weight in two ways
    // 1. only scoreWeight(User enters specific value) - use 100 as denominator and entered value as numerator
    // 2. numerator and denominator(User use Equal Distribution feature)
    const { scoreWeightNumerator, scoreWeightDenominator } = testcase

    if (testcase.scoreWeight !== undefined) {
      return {
        numerator: testcase.scoreWeight,
        denominator: 100
      }
    }

    if (
      scoreWeightNumerator !== undefined &&
      scoreWeightDenominator !== undefined
    ) {
      if (scoreWeightDenominator === 0) {
        return {
          numerator: scoreWeightNumerator,
          denominator: 100
        }
      }

      return {
        numerator: scoreWeightNumerator,
        denominator: scoreWeightDenominator
      }
    }

    return {
      numerator: 0,
      denominator: 1
    }
  }

  async createTestcases(testcases: Testcase[], problemId: number) {
    // Before upload, clean up all the original testcases
    await this.removeAllTestcaseFiles(problemId)

    const promises = testcases.map(async (testcase, index) => {
      try {
        const fraction = this.convertToFraction(testcase)

        const { id } = await this.prisma.problemTestcase.create({
          data: {
            problemId,
            scoreWeightNumerator: fraction.numerator,
            scoreWeightDenominator: fraction.denominator,
            scoreWeight: Math.round(
              (fraction.numerator / fraction.denominator) * 100
            ),
            isHidden: testcase.isHidden,
            order: index + 1
          }
        })

        const inFileName = `${problemId}/${id}.in`
        const outFileName = `${problemId}/${id}.out`
        const defaultTags = { hidden: 'true' } // s3 object tags are read from iris

        await this.storageService.uploadObject(
          inFileName,
          testcase.input,
          'txt',
          defaultTags
        )
        await this.storageService.uploadObject(
          outFileName,
          testcase.output,
          'txt',
          defaultTags
        )

        return { testcaseId: id }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2003') {
            throw new EntityNotExistException('problem')
          }
        }
        console.log('error code:', error.code)
        throw error
      }
    })

    const ids = await Promise.all(promises)
    return ids
  }

  /** @deprecated Testcases are going to be stored in S3, not database. Please check `createTestcases` */
  async createTestcasesLegacy(problemId: number, testcases: Array<Testcase>) {
    await Promise.all(
      testcases.map(async (tc, index) => {
        const fraction = this.convertToFraction(tc)

        const problemTestcase = await this.prisma.problemTestcase.create({
          data: {
            problemId,
            input: tc.input,
            output: tc.output,
            scoreWeightNumerator: fraction.numerator,
            scoreWeightDenominator: fraction.denominator,
            scoreWeight: Math.round(
              (fraction.numerator / fraction.denominator) * 100
            ),
            isHidden: tc.isHidden,
            order: index + 1
          }
        })
        return { index, id: problemTestcase.id }
      })
    )
  }

  /** @deprecated Testcases are going to be stored in S3, not database. Please check `createTestcases` */
  async createTestcaseLegacy(problemId: number, testcase: Testcase) {
    try {
      const fraction = this.convertToFraction(testcase)

      const problemTestcase = await this.prisma.problemTestcase.create({
        data: {
          problem: { connect: { id: problemId } },
          input: testcase.input,
          output: testcase.output,
          scoreWeightNumerator: fraction.numerator,
          scoreWeightDenominator: fraction.denominator,
          scoreWeight: Math.round(
            (fraction.numerator / fraction.denominator) * 100
          ),
          isHidden: testcase.isHidden
        }
      })
      return problemTestcase
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new EntityNotExistException('problem')

      throw error
    }
  }

  async updateTestcases(problemId: number, testcases: Array<Testcase>) {
    await Promise.all([
      this.prisma.problemTestcase.deleteMany({
        where: {
          problemId
        }
      })
    ])

    for (const tc of testcases) {
      const fraction = this.convertToFraction(tc)

      await this.prisma.problemTestcase.create({
        data: {
          problemId,
          input: tc.input,
          output: tc.output,
          scoreWeightNumerator: fraction.numerator,
          scoreWeightDenominator: fraction.denominator,
          scoreWeight: Math.round(
            (fraction.numerator / fraction.denominator) * 100
          ),
          isHidden: tc.isHidden
        }
      })
    }
  }

  async syncTestcases(problemId: number, testcases: Array<Testcase>) {
    // 기존에 존재하던 TC 모두 가져옴
    const existing = await this.prisma.problemTestcase.findMany({
      where: { problemId }
    })
    const existingMap = new Map(existing.map((tc) => [tc.id, tc]))

    // 인자로 전달받은 TC 중 id 필드가 존재하는 TC(기존 TC)의 id만 필터링해서 가져옴
    const updatedIds = new Set(
      testcases.filter((tc) => tc.id).map((tc) => tc.id)
    )

    // 기존에 존재하던 TC의 id 중 전달 받은 TC인자에 포함되어 있지 않은 id(삭제되어야할 TC의 id)
    const deleted = existing.filter((tc) => !updatedIds.has(tc.id))

    if (deleted.length > 0) {
      await this.prisma.problemTestcase.deleteMany({
        where: {
          id: {
            in: deleted.map((tc) => tc.id)
          }
        }
      })
    }

    for (const tc of testcases) {
      const weightFraction = this.convertToFraction(tc)
      const scoreWeight = Math.round(
        (weightFraction.numerator / weightFraction.denominator) * 100
      )
      if (tc.id) {
        // 전달받은 인자 중 id가 존재하는 경우 => 기존에 존재하던 TC이므로 바뀐 필드 있는지 확인 후 업데이트 수행
        const existingTc = existingMap.get(tc.id)
        if (
          existingTc &&
          (existingTc.input !== tc.input ||
            existingTc.output !== tc.output ||
            existingTc.isHidden !== tc.isHidden ||
            existingTc.scoreWeightNumerator !== tc.scoreWeightNumerator ||
            existingTc.scoreWeightDenominator !== tc.scoreWeightDenominator ||
            existingTc.scoreWeight !== tc.scoreWeight)
        ) {
          await this.prisma.problemTestcase.update({
            where: { id: tc.id },
            data: {
              input: tc.input,
              output: tc.output,
              isHidden: tc.isHidden,
              scoreWeight,
              scoreWeightNumerator: weightFraction.numerator,
              scoreWeightDenominator: weightFraction.denominator
            }
          })
        }
      } else {
        // 새로운 TC => 그냥 Create
        await this.prisma.problemTestcase.create({
          data: {
            problemId,
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden,
            scoreWeight,
            scoreWeightNumerator: weightFraction.numerator,
            scoreWeightDenominator: weightFraction.denominator
          }
        })
      }
    }
  }

  async uploadTestcase(
    fileInput: UploadFileInput,
    problemId: number,
    userRole: Role,
    userId: number
  ) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: { id: problemId },
      include: {
        sharedGroups: {
          select: {
            id: true
          }
        }
      }
    })

    if (userRole == Role.User && problem.createdById != userId) {
      const leaderGroupIds = (
        await this.prisma.userGroup.findMany({
          where: {
            userId,
            isGroupLeader: true
          }
        })
      ).map((group) => group.groupId)
      const sharedGroupIds = problem.sharedGroups.map((group) => group.id)
      const hasShared = sharedGroupIds.some((v) =>
        new Set(leaderGroupIds).has(v)
      )
      if (!hasShared) {
        throw new ForbiddenException(
          'User can only edit problems they created or were shared with'
        )
      }
    }

    const { filename, mimetype, createReadStream } = await fileInput.file
    if (
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ].includes(mimetype) === false
    ) {
      throw new UnprocessableDataException(
        'Extensions except Excel(.xlsx, .xls) are not supported'
      )
    }
    const header = {}
    const workbook = new Workbook()
    const worksheet = (await workbook.xlsx.read(createReadStream()))
      .worksheets[0]
    worksheet.getRow(1).eachCell((cell, idx) => {
      if (!ImportedTestcaseHeader.includes(cell.text))
        throw new UnprocessableFileDataException(
          `Field ${cell.text} is not supported: ${1}`,
          filename
        )
      header[cell.text] = idx
    })
    worksheet.spliceRows(1, 1)
    const row = worksheet.getRow(1)

    if (!header['Input'] || !header['Output']) {
      throw new UnprocessableFileDataException(
        'Input and Output fields are required',
        filename
      )
    }
    const input = row.getCell(header['Input']).text
    const output = row.getCell(header['Output']).text
    const scoreWeight =
      header['scoreWeight'] === undefined ||
      row.getCell(header['scoreWeight']).text.trim() === ''
        ? 1
        : parseInt(row.getCell(header['scoreWeight']).text.trim(), 10) || 1
    const isHidden =
      header['isHidden'] === undefined ||
      row.getCell(header['isHidden']).text.trim() === ''
        ? false
        : row.getCell(header['isHidden']).text.trim() === 'O'
    const testcase: Testcase = {
      input,
      output,
      scoreWeight,
      isHidden
    }

    return await this.createTestcaseLegacy(problemId, testcase)
  }

  async uploadTestcaseZip(file: FileUpload, problemId: number) {
    const { filename, mimetype, createReadStream } = file

    if (!filename.endsWith('.zip') || mimetype !== 'application/zip') {
      throw new UnprocessableDataException('Only zip files are accepted')
    }

    // Just check if the file size is less than maximum size
    await this.fileService.getFileSize(createReadStream(), MAX_ZIP_SIZE)

    // Testcase files are uploaded under s3://{bucketName}/{problemId}/{testcaseId}.{in|out}
    // Before upload, delete all objects under the problemId directory
    await this.removeAllTestcaseFiles(problemId)

    // Under zip, it's expected to have the following structure:
    //
    // {name}.zip/
    //   {chunkName1}.in
    //   {chunkName1}.out
    //   {chunkName2}.in
    //   {chunkName2}.out
    //   ...
    //
    // Then each {chunkName} is registered to the database with {testcaseId} as primary key
    // and the object is uploaded to S3 with the name {problemId}/{testcaseId}.{in|out}
    //
    // s3://{bucketName}/{problemId}/
    //  {testcaseId1}.{in}
    //  {testcaseId1}.{out}
    //  {testcaseId2}.{in}
    //  {testcaseId2}.{out}
    //  ...

    /** Mapper between chunk name and testcase ID. { [chunkName]: testcaseId } */
    const testcaseIdMapper: Record<string, number> = {}

    const inFiles = new Set<string>()
    const outFiles = new Set<string>()

    const stream = createReadStream().pipe(Parse({ forceStream: true }))

    try {
      for await (const chunk of stream) {
        // e.g) chunk.path: 'name.in' => chunkName: 'name', extension: 'in'
        const chunkName = chunk.path.split('.').slice(0, -1).join('.')
        const extension = chunk.path.split('.').pop()

        if (extension !== 'in' && extension !== 'out') {
          throw new UnprocessableDataException(
            'Testcase files must end with .in or .out'
          )
        }
        if (!(chunkName in testcaseIdMapper)) {
          const testcase = await this.prisma.problemTestcase.create({
            data: { problemId }
          })
          testcaseIdMapper[chunkName] = testcase.id
        }

        if (extension === 'in') {
          inFiles.add(chunkName)
        } else if (extension === 'out') {
          outFiles.add(chunkName)
        }

        const objectName = `${problemId}/${testcaseIdMapper[chunkName]}.${extension}`
        const defaultTags = { hidden: 'true' } // s3 object tags are read from iris

        await this.storageService.uploadObject(
          objectName,
          chunk,
          'txt',
          defaultTags
        )
      }

      // Check if all .in/.out files have corresponding .out/.in files
      if (!isEqual(inFiles, outFiles)) {
        throw new UnprocessableDataException(
          'Testcase files must have corresponding .in/.out files'
        )
      }
    } catch (error) {
      await this.removeAllTestcaseFiles(problemId)
      throw error
    }

    // Set the testcase order by alphabetical order of original file name
    // e.g) [aaa.(in|out), aab.(in|out), aac.(in|out), ...]
    const originalFileNames = Object.keys(testcaseIdMapper).sort()

    originalFileNames.forEach(async (name, index) => {
      const id = testcaseIdMapper[name]
      await this.prisma.problemTestcase.update({
        where: { id },
        data: { order: index + 1 }
      })
    })

    const testcaseIds = originalFileNames.map((name) => ({
      testcaseId: testcaseIdMapper[name]
    }))
    return testcaseIds
  }

  async removeAllTestcaseFiles(problemId: number) {
    const testcaseDir = problemId + '/'
    const files = await this.storageService.listObjects(testcaseDir, 'testcase')
    await Promise.all(
      files.map(async (file) => {
        if (!file.Key) return
        await this.storageService.deleteObject(file.Key, 'testcase')
      })
    )
    await this.prisma.problemTestcase.deleteMany({
      where: { problemId }
    })
  }

  async getProblemTestcases(problemId: number) {
    return await this.prisma.problemTestcase.findMany({
      where: {
        problemId
      },
      orderBy: {
        order: 'asc'
      }
    })
  }
}
