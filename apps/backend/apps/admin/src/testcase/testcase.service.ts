import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@admin/storage/storage.service'
import { TestcaseModel } from './model/testcase.model'

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

    return testcases
  }

  // TODO: add method to download full testcases in a zip file
}
