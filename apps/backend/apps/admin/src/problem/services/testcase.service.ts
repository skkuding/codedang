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

  /**
   * 분수 형태로 scoreWeight를 변환하는 헬퍼 함수
   * 기존 scoreWeight 값이 있으면 그것을 분자로, 100을 분모로 설정
   * 새로운 분자/분모 값이 있으면 그것을 사용
   */
  private convertToFraction(testcase: Testcase): {
    numerator: number
    denominator: number
  } {
    // 새로운 분수 형태가 제공된 경우
    if (
      testcase.scoreWeightNumerator !== undefined &&
      testcase.scoreWeightDenominator !== undefined
    ) {
      return {
        numerator: testcase.scoreWeightNumerator,
        denominator: testcase.scoreWeightDenominator
      }
    }

    // 기존 scoreWeight만 있는 경우 (하위 호환성)
    if (testcase.scoreWeight !== undefined) {
      return {
        numerator: testcase.scoreWeight,
        denominator: 100
      }
    }

    // 아무것도 제공되지 않은 경우 기본값
    return {
      numerator: 1,
      denominator: 1
    }
  }

  /**
   * Equal distribution 계산 함수
   * 일부 테스트케이스는 수동 지정, 나머지는 equal distribution
   */
  private calculateEqualDistribution(
    totalTestcases: number,
    manualTestcases: { numerator: number; denominator: number }[]
  ): { numerator: number; denominator: number }[] {
    if (manualTestcases.length === 0) {
      // 모든 테스트케이스가 equal distribution
      const result: { numerator: number; denominator: number }[] = []
      for (let i = 0; i < totalTestcases; i++) {
        result.push({ numerator: 1, denominator: totalTestcases })
      }
      return result
    }

    // 수동 지정된 가중치의 합 계산 (분수 덧셈)
    let sumNumerator = 0
    let lcmDenominator = 1

    // LCM 계산을 위한 GCD 함수
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    const lcm = (a: number, b: number): number => (a * b) / gcd(a, b)

    // 모든 분모의 LCM 계산
    manualTestcases.forEach((tc) => {
      lcmDenominator = lcm(lcmDenominator, tc.denominator)
    })

    // LCM을 기준으로 분자 합 계산
    manualTestcases.forEach((tc) => {
      sumNumerator += tc.numerator * (lcmDenominator / tc.denominator)
    })

    // 남은 가중치 계산
    const remainingNumerator = lcmDenominator - sumNumerator
    const remainingCount = totalTestcases - manualTestcases.length

    if (remainingNumerator <= 0 || remainingCount <= 0) {
      throw new UnprocessableDataException('Invalid weight distribution')
    }

    // 남은 테스트케이스들의 가중치
    const result: { numerator: number; denominator: number }[] = [
      ...manualTestcases
    ]
    const equalDenominator = lcmDenominator * remainingCount

    for (let i = 0; i < remainingCount; i++) {
      result.push({
        numerator: remainingNumerator,
        denominator: equalDenominator
      })
    }

    return result
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
            ), // 하위 호환성
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
            ), // 하위 호환성
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
          ), // 하위 호환성
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
          ), // 하위 호환성
          isHidden: tc.isHidden
        }
      })
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
