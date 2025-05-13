import { Injectable } from '@nestjs/common'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'
import { TestcaseModel, UpdateTestcaseModel } from './model/testcase.model'

@Injectable()
export class TestcaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  async getTestcases(
    problemId: number,
    readBytes = 5120
  ): Promise<TestcaseModel[]> {
    const testcaseInfos = await this.prisma.problemTestcase.findMany({
      where: { problemId },
      select: {
        id: true,
        order: true,
        scoreWeight: true,
        isHidden: true,
        // TODO: remove input/output field after all input/output are migrated to s3
        input: true,
        output: true
      }
    })

    const testcases = await Promise.all(
      testcaseInfos.map(async (testcase) => {
        // This is a workaround for testcases still stored in database
        // If input/output are stored in database, skip reading from s3
        if (testcase.input != null && testcase.output != null) {
          const input = testcase.input.slice(0, readBytes)
          const output = testcase.output.slice(0, readBytes)
          const isTruncated =
            testcase.input.length > readBytes ||
            testcase.output.length > readBytes

          return {
            ...testcase,
            problemId,
            input,
            output,
            isTruncated
          } satisfies TestcaseModel
        }

        const inFilename = `${problemId}/${testcase.id}.in`
        const outFilename = `${problemId}/${testcase.id}.out`
        const inText = await this.storageService.readObject(
          inFilename,
          'testcase',
          { readBytes }
        )
        const outText = await this.storageService.readObject(
          outFilename,
          'testcase',
          { readBytes }
        )

        // This is not very precise if input/output have exactly `readBytes` length,
        // but it is not a big problem so let's simplify the code for now
        const isTruncated =
          inText.length >= readBytes || outText.length >= readBytes

        return {
          ...testcase,
          problemId,
          input: inText,
          output: outText,
          isTruncated
        } satisfies TestcaseModel
      })
    )

    // sort testcases by order
    testcases.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    return testcases
  }

  async updateTestcases(testcases: UpdateTestcaseModel[], problemId: number) {
    const existingTestcases = await this.prisma.problemTestcase.findMany({
      where: { problemId },
      select: { id: true }
    })
    const unusedIds = new Set(existingTestcases.map((testcase) => testcase.id))

    await Promise.all(
      testcases.map(async (testcase, index) => {
        if (testcase.input && testcase.output) {
          const data = await this.prisma.problemTestcase.create({
            data: {
              problemId,
              order: index + 1,
              scoreWeight: testcase.scoreWeight,
              isHidden: testcase.isHidden
            }
          })
          const inFileName = `${problemId}/${data.id}.in`
          const outFileName = `${problemId}/${data.id}.out`
          const defaultTags = { hidden: String(data.isHidden) }

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
          return
        }

        if (testcase.id != undefined) {
          if (unusedIds.has(testcase.id)) {
            unusedIds.delete(testcase.id)
          } else {
            throw new UnprocessableDataException(
              'Testcase id is not found or duplicated'
            )
          }
          const existingTestcase = await this.prisma.problemTestcase.findUnique(
            {
              where: { id: testcase.id }
            }
          )
          if (!existingTestcase) {
            throw new EntityNotExistException(`Testcase ${testcase.id}`)
          }
          await this.prisma.problemTestcase.update({
            where: { id: testcase.id },
            data: {
              order: index + 1,
              input: testcase.input,
              output: testcase.output,
              scoreWeight: testcase.scoreWeight,
              isHidden: testcase.isHidden
            }
          })
          // TODO: update s3 object tag
          return
        }

        throw new UnprocessableDataException(
          'Either id or input/output is required'
        )
      })
    )

    if (unusedIds.size > 0) {
      await Promise.all(
        [...unusedIds].map(async (id) => {
          await this.removeTestcase(id)
        })
      )
    }
  }

  async removeTestcase(testcaseId: number) {
    const testcase = await this.prisma.problemTestcase.findUniqueOrThrow({
      where: { id: testcaseId }
    })
    try {
      const inputObject = `${testcase.problemId}/${testcase.id}.in`
      const outputObject = `${testcase.problemId}/${testcase.id}.out`
      await this.storageService.deleteObject(inputObject, 'testcase')
      await this.storageService.deleteObject(outputObject, 'testcase')
    } catch (_) {
      // ignore error in case the testcase is stored in database
    }
    await this.prisma.problemTestcase.delete({
      where: { id: testcaseId }
    })
  }

  // TODO: add method to download full testcases in a zip file
}
