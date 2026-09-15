import { ForbiddenException, Injectable } from '@nestjs/common'
import {
  CollaboratorRole,
  CollaboratorStatus,
  Role,
  type ToolType
} from '@prisma/client'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

const MAX_TOOL_FILE_SIZE = 10 * 1024 * 1024 // 10MB

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyToolAccess(
    problemId: number,
    userId: number,
    userRole: Role
  ): Promise<void> {
    if (userRole !== Role.User) {
      return
    }

    const problem = await this.prisma.mandeuldangProblem.findUniqueOrThrow({
      where: {
        id: problemId
      },
      select: {
        createdById: true,
        mandeuldangCollaborators: {
          where: {
            userId,
            status: CollaboratorStatus.Active
          },
          select: {
            role: true
          }
        }
      }
    })

    const isCreator = problem.createdById === userId

    const hasEditPermission = problem.mandeuldangCollaborators.some(
      (collaborator) =>
        collaborator.role === CollaboratorRole.Owner ||
        collaborator.role === CollaboratorRole.Editor
    )

    if (!isCreator && !hasEditPermission) {
      throw new ForbiddenException(
        'You do not have permission to manage tools for this problem'
      )
    }
  }

  async uploadMandeuldangToolFile(
    problemId: number,
    toolType: ToolType,
    file: FileUpload,
    userId: number,
    userRole: Role
  ) {
    await this.verifyToolAccess(problemId, userId, userRole)

    const { filename, createReadStream } = file

    //ReadStream → [chunk1, chunk2, chunk3, ...] → Buffer.concat
    //→ 최종 Buffer로 변환해 → DB(PostgreSQL)에 저장
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

    // (problemId, toolType) unique — 재업로드 시 갱신
    const tool = await this.prisma.mandeuldangTool.upsert({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { problemId_toolType: { problemId, toolType } },
      update: { fileName: filename, fileContent },
      create: { problemId, toolType, fileName: filename, fileContent }
    })
    return tool
  }

  async deleteMandeuldangFile(
    problemId: number,
    toolType: ToolType,
    userId: number,
    userRole: Role
  ) {
    await this.verifyToolAccess(problemId, userId, userRole)

    return this.prisma.mandeuldangTool.delete({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { problemId_toolType: { problemId, toolType } }
    })
  }
}
