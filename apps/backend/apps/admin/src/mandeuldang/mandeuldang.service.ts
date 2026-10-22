import { Injectable } from '@nestjs/common'
import { ToolType, type Role } from '@prisma/client'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { FileService } from './file/file.service'
import { MandeuldangPublicationService } from './mandeuldang-pub.service'

@Injectable()
export class MandeuldangService {
  constructor(
    private readonly fileService: FileService,
    private readonly publicationService: MandeuldangPublicationService
  ) {}

  async uploadMandeuldangTool(
    problemId: number,
    toolType: ToolType,
    file: FileUpload,
    userId: number,
    userRole: Role
  ) {
    return await this.fileService.uploadMandeuldangToolFile(
      problemId,
      toolType,
      file,
      userId,
      userRole
    )
  }

  async deleteMandeuldangTool(
    problemId: number,
    toolType: ToolType,
    userId: number,
    userRole: Role
  ) {
    return this.fileService.deleteMandeuldangToolFile(
      problemId,
      toolType,
      userId,
      userRole
    )
  }

  //파일 실행
  async runGenerator(
    problemId: number,
    requesterId: number,
    generatorArgs: string[],
    testcaseCount: number
  ) {
    return await this.publicationService.publishGeneratorMessage(
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
