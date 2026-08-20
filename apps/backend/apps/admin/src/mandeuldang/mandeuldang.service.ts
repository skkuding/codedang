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
    //DB에 파일 저장
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
    testCaseCount: number
  ) {
    await this.publicationService.publishGeneratorMessage(
      problemId,
      requesterId,
      generatorArgs,
      testCaseCount
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
