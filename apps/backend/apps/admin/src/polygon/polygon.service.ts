import { Injectable } from '@nestjs/common'
import { ToolType } from '@prisma/client'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { PrismaService } from '@libs/prisma'
import { FileService } from './file/file.service'
import { PolygonPublicationService } from './polygon-pub.service'

@Injectable()
export class PolygonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly publicationService: PolygonPublicationService
  ) {}

  async uploadPolygonTool(
    problemId: number,
    toolType: ToolType,
    file: FileUpload
  ) {
    //DB에 파일 저장
    await this.fileService.uploadPolygonToolFile(problemId, toolType, file)
  }

  async deletePolygonTool(problemId: number, toolType: ToolType) {
    return this.fileService.deletePolygonFile(problemId, toolType)
  }

  //파일 실행
  async runGenerator(
    problemId: number,
    generatorArgs: string[],
    testCaseCount: number
  ) {
    await this.publicationService.publishGeneratorMessage(
      problemId,
      generatorArgs,
      testCaseCount
    )
  }

  async runValidator(problemId: number) {
    await this.publicationService.publishValidatorMessage(problemId)
  }

  //테스트케이스 저장
}
