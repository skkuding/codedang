import { ForbiddenException, Injectable } from '@nestjs/common'
import { Prisma, Role } from '@prisma/client'
import { isEqual } from 'es-toolkit'
import { Workbook } from 'exceljs'
import { createWriteStream, promises as fsp } from 'fs'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import StreamZip from 'node-stream-zip'
import * as os from 'os'
import * as path from 'path'
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
import type { ScoreWeights, Testcase } from '../model/testcase.input'
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

  private convertToFraction<T extends ScoreWeights>(
    testcase: T
  ): {
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

  async createTestcases(
    testcases: Testcase[],
    problemId: number,
    userId: number,
    userRole: Role
  ) {
    await this.checkProblemEditPermission(problemId, userId, userRole)
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
    const sample: Testcase[] = []
    const hidden: Testcase[] = []

    for (const tc of testcases) {
      if (tc.isHidden) hidden.push(tc)
      else sample.push(tc)
    }

    const orderedTestcases = [
      ...sample.map((tc, i) => ({ ...tc, order: i + 1 })),
      ...hidden.map((tc, i) => ({ ...tc, order: i + 1 }))
    ]

    await Promise.all(
      orderedTestcases.map(async (tc) => {
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
            order: tc.order
          }
        })
        return { order: tc.order, id: problemTestcase.id }
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

  async syncTestcases(problemId: number, testcases: Array<Testcase>) {
    // 기존에 존재하던 유효한 TC 모두 가져옴
    const existing = await this.prisma.problemTestcase.findMany({
      where: {
        problemId,
        isOutdated: false
      }
    })
    const existingMap = new Map(existing.map((tc) => [tc.id, tc]))

    // 인자로 전달받은 TC 중 id 필드가 존재하는 TC(기존 TC)의 id만 필터링해서 가져옴
    const updatedIds = new Set(
      testcases.filter((tc) => tc.id).map((tc) => tc.id)
    )

    // 기존에 존재하던 TC의 id 중 전달 받은 TC인자에 포함되어 있지 않은 id(삭제되어야할 TC의 id)
    const outdated = existing.filter((tc) => !updatedIds.has(tc.id))
    const outdatedTime = new Date()
    if (outdated.length > 0) {
      await Promise.all([
        outdated.map(async (tc) => {
          return await this.prisma.problemTestcase.update({
            where: {
              id: tc.id
            },
            data: {
              isOutdated: true,
              outdateTime: outdatedTime
            }
          })
        })
      ])
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
            existingTc.scoreWeight !== tc.scoreWeight ||
            existingTc.scoreWeightDenominator !== tc.scoreWeightDenominator ||
            existingTc.scoreWeightNumerator !== tc.scoreWeightNumerator)
        ) {
          await this.prisma.problemTestcase.update({
            where: {
              id: tc.id
            },
            data: {
              isOutdated: true,
              outdateTime: outdatedTime
            }
          })

          const created = await this.prisma.problemTestcase.create({
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
          tc.id = created.id
        }
      } else {
        // 새로운 TC => 그냥 Create
        const created = await this.prisma.problemTestcase.create({
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
        tc.id = created.id
      }
    }

    const sample: Testcase[] = []
    const hidden: Testcase[] = []

    for (const tc of testcases) {
      if (tc.isHidden) hidden.push(tc)
      else sample.push(tc)
    }

    const orderedTestcases = [
      ...sample.map((tc, i) => ({ ...tc, order: i + 1 })),
      ...hidden.map((tc, i) => ({ ...tc, order: i + 1 }))
    ]

    await Promise.all(
      orderedTestcases.map((tc) =>
        this.prisma.problemTestcase.update({
          where: { id: tc.id },
          data: { order: tc.order }
        })
      )
    )
  }

  async uploadTestcase(
    fileInput: UploadFileInput,
    problemId: number,
    userRole: Role,
    userId: number
  ) {
    await this.checkProblemEditPermission(problemId, userId, userRole)

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

  async uploadTestcaseZip(
    file: FileUpload,
    problemId: number,
    userId: number,
    userRole: Role
  ) {
    await this.checkProblemEditPermission(problemId, userId, userRole)
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
        where: {
          id,
          isOutdated: false
        },
        data: { order: index + 1 }
      })
    })

    const testcaseIds = originalFileNames.map((name) => ({
      testcaseId: testcaseIdMapper[name]
    }))
    return testcaseIds
  }

  async uploadTestcaseZipLegacy({
    file,
    problemId,
    isHidden,
    scoreWeights,
    userId,
    userRole
  }: {
    file: FileUpload
    problemId: number
    isHidden: boolean
    scoreWeights: ScoreWeights[]
    userId: number
    userRole: Role
  }) {
    await this.checkProblemEditPermission(problemId, userId, userRole)

    const BATCH = 25
    const { filename, mimetype, createReadStream } = file

    if (!filename.endsWith('.zip') || mimetype !== 'application/zip') {
      throw new UnprocessableDataException('Only zip files are accepted')
    }
    await this.fileService.getFileSize(createReadStream(), MAX_ZIP_SIZE)

    const justOutdated = await this.prisma.$transaction(async (tx) => {
      const ids = (
        await tx.problemTestcase.findMany({
          where: { problemId, isOutdated: false, isHidden },
          select: { id: true }
        })
      ).map((r) => r.id)
      if (ids.length)
        await tx.problemTestcase.updateMany({
          where: { id: { in: ids } },
          data: { isOutdated: true }
        })
      return ids
    })

    // ZIP을 임시파일에 저장
    const tmpDir = await fsp.mkdtemp(
      path.join(os.tmpdir(), `testcases-${problemId}-`)
    )
    const tmpZip = path.join(tmpDir, 'upload.zip')
    await new Promise<void>((res, rej) => {
      const ws = createWriteStream(tmpZip)
      createReadStream().pipe(ws).on('finish', res).on('error', rej)
    })
    const zip = new StreamZip.async({ file: tmpZip })

    try {
      const entries = await zip.entries()
      const inFiles = new Map<number, string>()
      const outFiles = new Map<number, string>()
      let max = 0

      for (const name of Object.keys(entries)) {
        const e = entries[name]
        if (e.isDirectory) continue
        const filename = path.basename(name)
        if (filename.startsWith('.')) continue
        const dot = filename.lastIndexOf('.')
        if (dot <= 0) continue
        const ext = filename.slice(dot + 1).toLowerCase()
        if (ext !== 'in' && ext !== 'out') continue

        const n = Number(filename.slice(0, dot))
        if (!Number.isInteger(n) || n <= 0)
          throw new UnprocessableDataException(
            `File name must be a positive integer: ${filename}`
          )
        max = Math.max(max, n)
        if (ext === 'in') {
          if (inFiles.has(n))
            throw new UnprocessableDataException(`Duplicate ${n}.in`)
          inFiles.set(n, name)
        } else {
          if (outFiles.has(n))
            throw new UnprocessableDataException(`Duplicate ${n}.out`)
          outFiles.set(n, name)
        }
      }

      if (!max) throw new UnprocessableDataException('No testcase files found.')

      for (let i = 1; i <= max; i++) {
        if (!inFiles.has(i) || !outFiles.has(i)) {
          throw new UnprocessableDataException(`Missing pair for index ${i}`)
        }
      }

      if (scoreWeights?.length !== max) {
        throw new UnprocessableDataException(
          `scoreWeights length (${scoreWeights.length}) must match testcase count (${max})`
        )
      }

      let batch: Array<Testcase & { problemId: number }> = []

      const flush = async () => {
        if (!batch.length) return
        await this.prisma.problemTestcase.createMany({ data: batch })
        batch = []
      }

      for (let i = 1; i <= max; i++) {
        const [inputBuf, outputBuf] = await Promise.all([
          zip.entryData(inFiles.get(i)!),
          zip.entryData(outFiles.get(i)!)
        ])

        const fraction = this.convertToFraction(scoreWeights[i - 1])

        const row = {
          problemId,
          input: inputBuf.toString('utf8'),
          output: outputBuf.toString('utf8'),
          order: i,
          scoreWeightNumerator: fraction.numerator,
          scoreWeightDenominator: fraction.denominator,
          scoreWeight: Math.round(
            (fraction.numerator / fraction.denominator) * 100
          ),
          isHidden
        }
        batch.push(row)
        if (batch.length >= BATCH) await flush()
      }
      await flush()

      // Problem의 is*UploadedByZip 속성 변경
      if (isHidden) {
        await this.prisma.problem.update({
          where: { id: problemId },
          data: { isHiddenUploadedByZip: true }
        })
      } else {
        await this.prisma.problem.update({
          where: { id: problemId },
          data: { isSampleUploadedByZip: true }
        })
      }

      const ids = await this.prisma.problemTestcase.findMany({
        where: { problemId, isOutdated: false, isHidden },
        orderBy: { order: 'asc' },
        select: { id: true }
      })
      return ids.map(({ id }) => ({ testcaseId: id }))
    } catch (e) {
      //롤백
      await this.prisma.problemTestcase.deleteMany({
        where: { problemId, isOutdated: false, isHidden }
      })
      await this.prisma.problemTestcase.updateMany({
        where: {
          id: {
            in: justOutdated
          }
        },
        data: { isOutdated: false }
      })
      throw e
    } finally {
      await zip.close().catch(() => {})
      //임시파일 삭제
      try {
        await fsp.unlink(tmpZip)
      } catch {
        console.log(`Failed to unlink ${tmpDir}`)
      }
      try {
        await fsp.rmdir(tmpDir)
      } catch {
        console.log(`Failed to delete ${tmpDir}`)
      }
    }
  }

  private async checkProblemEditPermission(
    problemId: number,
    userId: number,
    userRole: Role
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
    await this.prisma.problemTestcase.updateMany({
      where: { problemId },
      data: {
        isOutdated: true,
        outdateTime: new Date()
      }
    })
  }

  /**
   * 특정 문제에 해당하는 테스트케이스들을 반환합니다.
   * problem의 isSampleUploadedByZip과 isHiddenUploadedByZip에 따라 각 유형의 테스트케이스의 IO 포함 여부를 판단합니다.
   * @param problemId - 문제 ID
   * @returns 조건에 부합하는 테스트케이스들의 배열
   */
  async getProblemTestcases(problemId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const problem = await tx.problem.findUnique({
        where: { id: problemId },
        select: { isHiddenUploadedByZip: true, isSampleUploadedByZip: true }
      })
      if (!problem) {
        throw new EntityNotExistException('Problem')
      }

      const hiddenTestcases = await tx.problemTestcase.findMany({
        where: {
          problemId,
          isOutdated: false,
          isHidden: true
        },
        select: {
          id: true,
          order: true,
          isHidden: true,
          scoreWeightDenominator: true,
          scoreWeightNumerator: true,
          ...(problem.isHiddenUploadedByZip
            ? {}
            : { input: true, output: true })
        },
        orderBy: {
          order: 'asc'
        }
      })

      const sampleTestcases = await tx.problemTestcase.findMany({
        where: {
          problemId,
          isOutdated: false,
          isHidden: false
        },
        select: {
          id: true,
          order: true,
          isHidden: true,
          scoreWeightDenominator: true,
          scoreWeightNumerator: true,
          ...(problem.isSampleUploadedByZip
            ? {}
            : { input: true, output: true })
        },
        orderBy: {
          order: 'asc'
        }
      })

      return sampleTestcases.concat(hiddenTestcases)
    })
  }
}
