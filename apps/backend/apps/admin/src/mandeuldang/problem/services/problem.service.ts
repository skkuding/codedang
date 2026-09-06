import { Injectable } from '@nestjs/common'
import {
  CollaboratorRole,
  CollaboratorStatus,
  ProblemCreationMode,
  ProblemStatus
} from '@prisma/client'
import { MAX_DATE } from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { CreateMandeuldangProblemInput } from '../model/problem.input'
import type { MandeuldangProblemOutput } from '../model/problem.output'

@Injectable()
export class MandeuldangProblemService {
  constructor(private readonly prisma: PrismaService) {}

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
}
