import { Injectable } from '@nestjs/common'
import {
  CollaboratorRole,
  CollaboratorStatus,
  ProblemCreationMode,
  ProblemStatus
} from '@generated'
import {
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { UpdateMandeuldangProblemInput } from '../model/problem.input'
import { PublishCheckService } from './publish-check.service'

@Injectable()
export class MandeuldangProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publishCheckService: PublishCheckService
  ) {}

  // 수정 권한이 있는지 확인
  private async assertEditable(problemId: number, userId: number) {
    const collaborator = await this.prisma.mandeuldangCollaborator.findUnique({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { problemId_userId: { problemId, userId } }
    })
    if (
      !collaborator ||
      collaborator.status !== CollaboratorStatus.Approved ||
      collaborator.role === CollaboratorRole.Reviewer
    ) {
      throw new ForbiddenAccessException(
        'Only Owner or Editor can set a problem to public'
      )
    }
  }

  async updateProblem(input: UpdateMandeuldangProblemInput, userId: number) {
    const { id, tags, template, ...data } = input

    const problem = await this.prisma.problem.findFirstOrThrow({
      where: { id, creationMode: ProblemCreationMode.Mandeuldang }
    })

    await this.assertEditable(id, userId)

    return await this.prisma.$transaction(async (tx) => {
      const updated = await tx.problem.update({
        where: { id },
        data: {
          ...data,
          ...(template !== undefined && {
            template: [JSON.stringify(template)]
          }),
          ...(tags && {
            problemTag: {
              deleteMany: { tagId: { in: tags.delete } },
              create: tags.create.map((tagId) => ({ tagId }))
            }
          })
        }
      })

      const { canPublish } = await this.publishCheckService.check(
        problem.id,
        tx
      )

      // publish 상태인 문제인 경우 조건 만족시에만 저장 가능
      if (problem.status === ProblemStatus.Published) {
        if (!canPublish) {
          throw new UnprocessableDataException(
            'Edits that break publishing requirements cannot be saved.'
          )
        }
        return updated
      }

      // draft 상태인 문제인 경우 조건 만족시 draft->ready로 자동 승격
      // ready 상태인 문제인 경우 조건 불만족시 ready->draft로 자동 승격
      const nextStatus = canPublish ? ProblemStatus.Ready : ProblemStatus.Draft
      if (nextStatus !== problem.status) {
        await tx.problem.update({
          where: { id: problem.id },
          data: { status: nextStatus }
        })
      }
      return updated
    })
  }
}
