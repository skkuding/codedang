import { Injectable } from '@nestjs/common'
import {
  CollaboratorRole,
  CollaboratorStatus,
  ProblemCreationMode,
  ProblemStatus,
  Role
} from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { UpdateMandeuldangProblemInput } from '../model/problem.input'
import type { MandeuldangProblemOutput } from '../model/problem.output'
import { PublishCheckService } from './publish-check.service'

/** 목록/상세 조회 모두에서 재사용하는, "요청자의 협업 역할" 계산 로직. */
const resolveMyRole = (
  problem: {
    createdById: number | null
    mandeuldangCollaborators: Array<{
      userId: number
      role: CollaboratorRole
      status: CollaboratorStatus
    }>
  },
  userId: number
): `${CollaboratorRole}` | null => {
  // Owner는 항상 Owner 권한을 갖는다 — MandeuldangCollaborator에 Owner 행이 아직
  // 없더라도(협업자 등록은 다른 작업에서 다룬다) createdById로 대체 판단한다.
  if (problem.createdById === userId) {
    return CollaboratorRole.Owner
  }
  const myCollaborator = problem.mandeuldangCollaborators.find(
    (collaborator) => collaborator.userId === userId
  )
  return myCollaborator?.role ?? null
}

@Injectable()
export class MandeuldangProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publishCheckService: PublishCheckService
  ) {}

  /**
   * 내가 만든(Owner인) 만들당 문제 목록. 기본적으로 상태와 무관하게 전부 보여준다.
   * "management -> 내가 만든 문제" 화면용. `status`를 넘기면 그 상태로만 좁혀 조회한다.
   */
  async getMyProblems(
    userId: number,
    cursor: number | null,
    take: number,
    status?: ProblemStatus
  ): Promise<MandeuldangProblemOutput[]> {
    const paginator = this.prisma.getPaginator(cursor)
    const problems = await this.prisma.problem.findMany({
      ...paginator,
      take,
      where: {
        creationMode: ProblemCreationMode.Mandeuldang,
        createdById: userId,
        ...(status && { status })
      },
      include: {
        mandeuldangCollaborators: { where: { userId } }
      },
      orderBy: { updateTime: 'desc' }
    })
    return problems.map((problem) => ({
      ...problem,
      myRole: resolveMyRole(problem, userId)
    }))
  }

  /**
   * 제작 중인(기본적으로 아직 발행되지 않은) 만들당 문제 목록.
   * Owner이거나 승인된(Approved) Collaborator로 참여 중인 문제를 모두 포함한다 —
   * "내가 만든 문제"보다 넓은 범위다. "management -> 제작 중인 문제" 화면용.
   * `status`를 넘기면 "Published가 아님" 대신 그 상태로만(Draft만, Ready만) 좁혀 조회한다.
   */
  async getInProgressProblems(
    userId: number,
    cursor: number | null,
    take: number,
    status?: ProblemStatus
  ): Promise<MandeuldangProblemOutput[]> {
    const paginator = this.prisma.getPaginator(cursor)
    const problems = await this.prisma.problem.findMany({
      ...paginator,
      take,
      where: {
        creationMode: ProblemCreationMode.Mandeuldang,
        status: status ?? { not: ProblemStatus.Published },
        OR: [
          { createdById: userId },
          {
            mandeuldangCollaborators: {
              some: { userId, status: CollaboratorStatus.Approved }
            }
          }
        ]
      },
      include: {
        mandeuldangCollaborators: { where: { userId } }
      },
      orderBy: { updateTime: 'desc' }
    })
    return problems.map((problem) => ({
      ...problem,
      myRole: resolveMyRole(problem, userId)
    }))
  }

  /**
   * 문제 ID로 상세 조회. Statement, 발행 가능 여부, Solution/Tool/TestFile 목록,
   * Collaborator 목록, 요청자의 역할을 한 번에 반환한다.
   *
   * 접근 권한: Published 문제는 (기존 Problem API와 동등하게) 누구나 조회 가능하다.
   * 그 외(Draft/Ready)는 Owner·승인된 Collaborator·Admin/SuperAdmin만 조회할 수 있다.
   */
  async getProblem(
    id: number,
    userId: number,
    userRole: Role
  ): Promise<MandeuldangProblemOutput> {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
      include: {
        mandeuldangCollaborators: { include: { user: true } },
        mandeuldangSolution: true,
        mandeuldangTools: true,
        mandeuldangTestFiles: true
      }
    })

    if (!problem || problem.creationMode !== ProblemCreationMode.Mandeuldang) {
      throw new EntityNotExistException('MandeuldangProblem')
    }

    const myCollaborator = problem.mandeuldangCollaborators.find(
      (collaborator) => collaborator.userId === userId
    )
    const isOwner = problem.createdById === userId
    const isApprovedCollaborator =
      myCollaborator?.status === CollaboratorStatus.Approved
    const hasPrivilege = userRole === Role.Admin || userRole === Role.SuperAdmin

    const isVisible =
      problem.status === ProblemStatus.Published ||
      isOwner ||
      isApprovedCollaborator ||
      hasPrivilege

    if (!isVisible) {
      throw new ForbiddenAccessException(
        'Only the owner, an approved collaborator, or an admin can access a problem that is not yet published'
      )
    }

    const { canPublish, missing } = await this.publishCheckService.check(
      problem.id
    )

    return {
      ...problem,
      myRole: resolveMyRole(problem, userId),
      testFileCount: problem.mandeuldangTestFiles.length,
      canPublish,
      missingForPublish: missing
    }
  }

  /**
   * input에 따른 문제 수정.
   * 수정된 문제를 반환한다.
   *
   * 접근 권한: Owner 또는 Editor만 수정할 수 있다.
   */
  async updateProblem(input: UpdateMandeuldangProblemInput, userId: number) {
    const { id, tags, template, ...data } = input

    const problem = await this.prisma.problem.findFirstOrThrow({
      where: { id, creationMode: ProblemCreationMode.Mandeuldang }
    })

    // 수정 권한이 있는지 확인 (Owner, Editor만 가능)
    const collaborator = await this.prisma.mandeuldangCollaborator.findUnique({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { problemId_userId: { problemId: id, userId } }
    })
    if (
      !collaborator ||
      collaborator.status !== CollaboratorStatus.Approved ||
      collaborator.role === CollaboratorRole.Reviewer
    ) {
      throw new ForbiddenAccessException('Only Owner or Editor can edit')
    }

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

  /**
   * 문제 id로 문제 발행. 발행 조건을 확인한 후 상태를 published로 전환한다.
   * 발행된 문제를 반환한다.
   *
   * 접근 권한: Owner만 발행할 수 있다.
   */
  async publishProblem(problemId: number, userId: number) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: { id: problemId, creationMode: ProblemCreationMode.Mandeuldang }
    })

    // 발행 권한이 있는지 확인 (Owner만 가능)
    const collaborator = await this.prisma.mandeuldangCollaborator.findUnique({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { problemId_userId: { problemId, userId } }
    })
    if (
      !collaborator ||
      collaborator.status !== CollaboratorStatus.Approved ||
      collaborator.role !== CollaboratorRole.Owner
    ) {
      throw new ForbiddenAccessException('Only Owner can publish a problem')
    }

    if (problem.status !== ProblemStatus.Ready) {
      throw new UnprocessableDataException(
        'Only a Ready problem can be published'
      )
    }

    return await this.prisma.$transaction(async (tx) => {
      const { canPublish, missing } = await this.publishCheckService.check(
        problem.id,
        tx
      )
      if (!canPublish) {
        throw new UnprocessableDataException(
          `Cannot publish: missing ${missing.join(', ')}`
        )
      }

      return await tx.problem.update({
        where: { id: problem.id },
        data: { status: ProblemStatus.Published }
      })
    })
  }
}
