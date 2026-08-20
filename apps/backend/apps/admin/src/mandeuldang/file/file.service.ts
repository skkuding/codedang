import { Injectable } from '@nestjs/common'
import { Prisma, type ToolType } from '@prisma/client'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'

const MAX_TOOL_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TOOL_EXTENSIONS = ['.cpp', '.cc', '.cxx'] // C++만 허용

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  async uploadMandeuldangToolFile(
    problemId: number,
    toolType: ToolType,
    file: FileUpload
  ) {
    const { filename, createReadStream } = file

    if (!ALLOWED_TOOL_EXTENSIONS.some((ext) => filename.endsWith(ext))) {
      throw new UnprocessableDataException(
        `Unsupported file extension. Allowed: ${ALLOWED_TOOL_EXTENSIONS.join(', ')}`
      )
    }

    //ReadStream → [chunk1, chunk2, chunk3, ...] → Buffer.concat
    //→ 최종 Buffer로 변환해 → S3에 저장
    const chunks: Buffer[] = []
    let total = 0
    for await (const chunk of createReadStream()) {
      total += chunk.length
      if (total > MAX_TOOL_FILE_SIZE) {
        throw new UnprocessableDataException('File size exceeds maximum limit')
      }
      chunks.push(chunk)
    }
    const fileContent = Buffer.concat(chunks).toString('utf-8')

    // S3에 저장
    const filePath = `mandeuldang/${problemId}/tools/${toolType}.cpp`
    await this.storageService.uploadObject(filePath, fileContent, 'cpp')

    // DB엔 경로만 저장
    const tool = await this.prisma.mandeuldangTool.upsert({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { problemId_toolType: { problemId, toolType } },
      update: { fileName: filename, filePath },
      create: { problemId, toolType, fileName: filename, filePath }
    })
    return tool
  }

  async deleteMandeuldangToolFile(problemId: number, toolType: ToolType) {
    try {
      const tool = await this.prisma.mandeuldangTool.delete({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        where: { problemId_toolType: { problemId, toolType } }
      })
      // DB row 삭제 후 S3 파일도 삭제
      await this.storageService.deleteObject(tool.filePath, 'testcase')

      // TO DO: generator의 경우 생성된 테스트케이스 파일도 삭제

      return tool
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('MandeuldangTool')
      }
      throw error
    }
  }
}
