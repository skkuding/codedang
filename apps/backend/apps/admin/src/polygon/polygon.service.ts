import { Injectable } from '@nestjs/common'
import { ToolType } from '@prisma/client'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { PolygonAMQPService } from '@libs/amqp'
import { PrismaService } from '@libs/prisma'
import { FileService } from './file/file.service'

@Injectable()
export class PolygonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly polygonAMQPService: PolygonAMQPService
  ) {}

  async uploadPolygonTool(
    problemId: number,
    toolType: ToolType,
    file: FileUpload
  ) {
    //DB에 파일 저장
    const uploadedTool = await this.fileService.uploadPolygonToolFile(
      problemId,
      toolType,
      file
    )

    //RabbitMQ 메시지 발행
    await this.polygonAMQPService.publishPolygonToolUploadMessage(
      uploadedTool.problemId,
      uploadedTool.toolType
    )

    return uploadedTool
  }

  async deletePolygonTool(problemId: number, toolType: ToolType) {
    return this.fileService.deletePolygonFile(problemId, toolType)
  }
}
