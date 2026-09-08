import { ForbiddenException, Injectable } from '@nestjs/common'
import {
  CollaboratorRole,
  CollaboratorStatus,
  ProblemCreationMode,
  ProblemStatus
} from '@prisma/client'
import { MAX_DATE } from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'
import type { CreateMandeuldangProblemInput } from '../model/problem.input'
import type { MandeuldangProblemOutput } from '../model/problem.output'

@Injectable()
export class MandeuldangProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  async createProblem(
    input: CreateMandeuldangProblemInput,
    userId: number
  ): Promise<MandeuldangProblemOutput> {
    const { title, languages, ...data } = input

    // 제목은 빈 문자열일 수 없다.
    const normalizedTitle = title.trim()
    if (!normalizedTitle) {
      throw new UnprocessableDataException('Title cannot be empty')
    }

    // 시간 제한과 메모리 제한은 양수여야 한다.
    if (input.timeLimit != null && input.timeLimit <= 0) {
      throw new UnprocessableDataException(
        'Time limit must be greater than zero'
      )
    }

    if (input.memoryLimit != null && input.memoryLimit <= 0) {
      throw new UnprocessableDataException(
        'Memory limit must be greater than zero'
      )
    }

    const problem = await this.prisma.problem.create({
      data: {
        ...data,
        title: normalizedTitle,
        languages: languages ?? undefined,
        creationMode: ProblemCreationMode.Mandeuldang,
        status: ProblemStatus.Draft,
        createdById: userId,
        visibleLockTime: MAX_DATE,
        mandeuldangCollaborators: {
          create: {
            userId,
            role: CollaboratorRole.Owner,
            status: CollaboratorStatus.Approved
          }
        }
      },
      include: {
        mandeuldangCollaborators: true
      }
    })

    return {
      ...problem,
      myRole: CollaboratorRole.Owner,
      testFileCount: 0
    }
  }

  async deleteProblem(id: number, userId: number) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id,
        creationMode: ProblemCreationMode.Mandeuldang
      },
      include: {
        mandeuldangCollaborators: {
          where: {
            userId,
            role: CollaboratorRole.Owner
          }
        }
      }
    })

    // 해당 문제의 Owner만 삭제할 수 있다.
    if (problem.mandeuldangCollaborators.length === 0) {
      throw new ForbiddenException('Only the owner can delete this problem')
    }

    // Problem description에 이미지가 포함되어 있다면 삭제
    const uuidImageFileNames = this.extractUUIDs(problem.description)

    if (uuidImageFileNames.length > 0) {
      await this.prisma.file.deleteMany({
        where: {
          filename: {
            in: uuidImageFileNames
          }
        }
      })

      const deleteFromS3Results = uuidImageFileNames.map((filename: string) => {
        return this.storageService.deleteFile(filename)
      })

      await Promise.all(deleteFromS3Results)
    }

    return await this.prisma.problem.delete({
      where: { id }
    })
  }

  extractUUIDs(input: string | null) {
    if (!input) {
      return []
    }

    const uuidRegex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi

    return input.match(uuidRegex) ?? []
  }
}
