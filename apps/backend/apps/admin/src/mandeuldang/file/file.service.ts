import { Injectable } from '@nestjs/common'
import { CollaboratorRole, ToolType } from '@prisma/client'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import type { AuthenticatedRequest } from '@libs/auth'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'
import { MandeuldangPermissionService } from '../auth/mandeuldang-permission.service'

const MAX_TOOL_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TOOL_EXTENSIONS = ['.cpp', '.cc', '.cxx'] // C++만 허용

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly permissionService: MandeuldangPermissionService
  ) {}

  async uploadMandeuldangToolFile(
    problemId: number,
    toolType: ToolType,
    file: FileUpload,
    requester: Pick<AuthenticatedRequest['user'], 'id' | 'role'>
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

    // Recheck access after receiving the full file, before writing to storage.
    await this.permissionService.assertAccess(problemId, requester, {
      roles: [CollaboratorRole.Owner, CollaboratorRole.Editor]
    })

    // S3에 저장
    const filePath = `mandeuldang/${problemId}/tools/${toolType}`
    await this.storageService.uploadObject(
      filePath,
      fileContent,
      'cpp',
      undefined,
      'mandeuldang'
    )

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
    const tool = await this.prisma.mandeuldangTool.findUniqueOrThrow({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { problemId_toolType: { problemId, toolType } }
    })

    await this.storageService.deleteObject(tool.filePath, 'mandeuldang')

    if (toolType === ToolType.Generator) {
      const testcaseFiles = await this.storageService.listObjects(
        `${problemId}/`,
        'testcase'
      )

      const keys = testcaseFiles.flatMap((file) => (file.Key ? [file.Key] : []))

      await this.storageService.deleteObjects(keys, 'testcase')
    }
    await this.prisma.$transaction([
      this.prisma.mandeuldangTool.delete({ where: { id: tool.id } }),
      ...(toolType === ToolType.Generator
        ? [this.prisma.mandeuldangTestFile.deleteMany({ where: { problemId } })]
        : [])
    ])
    return tool
  }
}
