import { Injectable } from '@nestjs/common'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { PrismaService } from '@libs/prisma'
import { ToolType } from '@admin/@generated'
import { FileService } from './file/file.service'
import { MandeuldangPublicationService } from './mandeuldang-pub.service'

@Injectable()
export class MandeuldangService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly publicationService: MandeuldangPublicationService
  ) {}

  async uploadMandeuldangTool(
    problemId: number,
    toolType: ToolType,
    file: FileUpload
  ) {
    return await this.fileService.uploadMandeuldangToolFile(
      problemId,
      toolType,
      file
    )
  }

  async deleteMandeuldangTool(problemId: number, toolType: ToolType) {
    return this.fileService.deleteMandeuldangToolFile(problemId, toolType)
  }

  //파일 실행
  async runGenerator(
    problemId: number,
    requesterId: number,
    generatorArgs: string[],
    testcaseCount: number
  ) {
    await this.publicationService.publishGeneratorMessage(
      problemId,
      requesterId,
      generatorArgs,
      testcaseCount
    )
  }

  async runValidator(problemId: number, requesterId: number) {
    return await this.publicationService.publishValidatorMessage(
      problemId,
      requesterId
    )
  }

  //테스트케이스 저장
}
