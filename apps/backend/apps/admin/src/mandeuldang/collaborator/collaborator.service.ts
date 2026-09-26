import { Injectable } from '@nestjs/common'
import {
  CollaboratorRole,
  CollaboratorStatus,
  Prisma,
  ProblemCreationMode
} from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  DuplicateFoundException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  CollaboratorInput,
  CollaboratorUpdateInput
} from './model/collaborator.input'

@Injectable()
export class CollaboratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 해당 mandeuldang 문제에 협업자를 초대합니다.
   *
   * 협업자 초대는 1. 해당 문제의 소유자 2. status: Approved, role:Editor 인 경우에만 가능
   *
   * @param {number} inviterId 초대자의 id
   * @param {number} problemId 생성 문제의 id
   * @param {CollaboratorInput} model 협업자 id, role
   * @returns {mandeuldangCollaborator} 협업자 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * -해당 problemId에 해당하는 문제가 존재하지 않는 경우
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -초대자가 문제의 소유자가 아니면서 status: Approved, role:Editor가 아닌 경우
   * @throws {DuplicateFoundException} 아래와 같은 경우 발생합니다.
   * -이미 초대된 협업자를 초대한 경우
   * -문제 소유자를 초대한 경우
   * @throws {UnprocessableDataException} 아래와 같은 경우 발생합니다.
   * - Owner role로 초대을 하는 경우
   */
  async inviteCollaborator(
    inviterId: number,
    problemId: number,
    input: CollaboratorInput
  ) {
    const { userEmail, role } = input

    if (role === CollaboratorRole.Owner) {
      throw new UnprocessableDataException('Cannot assign Owner role')
    }

    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true }
    })
    if (!user) {
      throw new EntityNotExistException('User not found')
    }
    const userId = user.id

    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId, creationMode: ProblemCreationMode.Mandeuldang },
      select: { createdById: true }
    })
    if (!problem)
      throw new EntityNotExistException('MandeuldangProblem not found')

    const isOwner = problem.createdById === inviterId

    if (!isOwner) {
      const inviterInfo = await this.prisma.mandeuldangCollaborator.findFirst({
        where: {
          problemId,
          userId: inviterId
        },
        select: { status: true, role: true }
      })
      const canInvite =
        inviterInfo?.status === CollaboratorStatus.Approved &&
        inviterInfo?.role === CollaboratorRole.Editor
      if (!canInvite) {
        throw new ForbiddenAccessException(
          'No permission to invite collaborator'
        )
      }
    }

    const existing = await this.prisma.mandeuldangCollaborator.findFirst({
      where: {
        problemId,
        userId
      },
      select: { id: true, status: true }
    })
    if (existing && existing.status !== CollaboratorStatus.Rejected) {
      throw new DuplicateFoundException('invited existing Collaborator')
    }
    if (userId === problem.createdById) {
      throw new DuplicateFoundException('invited owner to collaborator')
    }
    const status = isOwner
      ? CollaboratorStatus.Approved
      : CollaboratorStatus.Pending

    const invitedAt = new Date()

    try {
      if (existing) {
        return await this.prisma.mandeuldangCollaborator.update({
          where: {
            id: existing.id,
            status: CollaboratorStatus.Rejected
          },
          data: {
            role,
            status,
            invitedById: inviterId,
            invitedAt,
            approvedAt: isOwner ? invitedAt : null
          }
        })
      }
      return await this.prisma.mandeuldangCollaborator.create({
        data: {
          problemId,
          userId,
          role,
          status,
          invitedById: inviterId,
          invitedAt,
          approvedAt: isOwner ? invitedAt : null
        }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DuplicateFoundException('Collaborator is already invited')
        }

        if (error.code === 'P2025') {
          throw new UnprocessableDataException(
            'Invitation state has changed. Please refresh and try again'
          )
        }
      }

      throw error
    }
  }

  /**
   * 요청한 상태의 만들당 협업자 목록을 반환합니다.
   *
   * - Approved 목록: Owner 또는 승인된 Editor·Reviewer가 조회할 수 있습니다.
   * - Pending·Rejected 목록: Owner만 조회할 수 있습니다.
   *
   * @param userId 조회 요청자의 ID
   * @param problemId 만들당 문제 ID
   * @param requestedStatus 조회할 협업 상태
   * @returns 협업자의 사용자 ID, 사용자명, 이메일, 역할 목록
   * @throws {EntityNotExistException}
   * 문제가 존재하지 않거나 만들당 문제가 아닌 경우
   * @throws {ForbiddenAccessException}
   * 요청한 목록을 조회할 권한이 없는 경우
   */
  async getCollaboratorsByStatus(
    userId: number,
    problemId: number,
    requestedStatus: CollaboratorStatus
  ) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId, creationMode: ProblemCreationMode.Mandeuldang },
      select: { createdById: true }
    })
    if (!problem)
      throw new EntityNotExistException('MandeuldangProblem not found')

    const isOwner = problem.createdById === userId

    if (requestedStatus === CollaboratorStatus.Approved) {
      // 승인된 참여자 목록: Owner 또는 승인된 Editor·Reviewer가 조회
      if (!isOwner) {
        const requester = await this.prisma.mandeuldangCollaborator.findFirst({
          where: {
            problemId,
            userId,
            status: CollaboratorStatus.Approved,
            role: {
              in: [CollaboratorRole.Editor, CollaboratorRole.Reviewer]
            }
          },
          select: { id: true }
        })

        if (!requester) {
          throw new ForbiddenAccessException(
            'No permission to view collaborators'
          )
        }
      }
    } else {
      // Pending·Rejected 목록: Owner만 조회
      if (!isOwner) {
        throw new ForbiddenAccessException(
          'No permission to view collaborators'
        )
      }
    }

    const collaborators = await this.prisma.mandeuldangCollaborator.findMany({
      where: {
        problemId,
        status: requestedStatus
      },
      select: {
        role: true,
        status: true,
        createTime: true,
        invitedAt: true,
        approvedAt: true,
        invitedBy: {
          select: {
            id: true,
            username: true
          }
        },
        user: {
          select: {
            username: true,
            id: true,
            email: true
          }
        }
      }
    })

    return collaborators.map((c) => ({
      username: c.user.username,
      id: c.user.id,
      email: c.user.email,
      role: c.role,
      status: c.status,
      invitedBy: c.invitedBy,
      invitedAt: c.invitedAt,
      approvedAt: c.approvedAt,
      createTime: c.createTime
    }))
  }

  /**
   * 문제 소유자가 협업 요청을 수락합니다.
   *
   * @param {number} createdById 문제 소유자의 id
   * @param {number} problemId 생성 문제의 id
   * @param {number} userId 협업자의 id
   * @returns {mandeuldangCollaborator} 협업자 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * -해당 problemId에 해당하는 문제가 존재하지 않는 경우
   * -해당 userId에 해당하는 협업자가 존재하지 않는 경우
   * @throws {UnprocessableDataException} 아래와 같은 경우 발생합니다.
   * -협업자의 status가 Pending이 아닌 경우
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -createdById가 해당 문제의 소유자가 아닌 경우
   */
  async approveCollaborator(
    createdById: number,
    problemId: number,
    userId: number
  ) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId, creationMode: ProblemCreationMode.Mandeuldang },
      select: { createdById: true }
    })
    if (!problem)
      throw new EntityNotExistException('MandeuldangProblem not found')

    if (problem.createdById !== createdById) {
      throw new ForbiddenAccessException('No permission to approve/reject')
    }
    const collaborator = await this.prisma.mandeuldangCollaborator.findFirst({
      where: { problemId, userId },
      select: { id: true, status: true }
    })
    if (!collaborator) {
      throw new EntityNotExistException('Collaborator not found')
    }

    if (collaborator.status !== CollaboratorStatus.Pending) {
      throw new UnprocessableDataException('Invitation is not pending')
    }

    try {
      return await this.prisma.mandeuldangCollaborator.update({
        where: {
          id: collaborator.id,
          status: CollaboratorStatus.Pending
        },
        data: {
          status: CollaboratorStatus.Approved,
          approvedAt: new Date()
        }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new UnprocessableDataException(
          'Invitation state has changed. Please refresh and try again'
        )
      }

      throw error
    }
  }

  /**
   * 문제 소유자가 협업 요청을 거절합니다.
   *
   * @param {number} createdById 문제 소유자의 id
   * @param {number} problemId 생성 문제의 id
   * @param {number} userId 협업자의 id
   * @returns {mandeuldangCollaborator} 삭제 협업자 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * -해당 problemId에 해당하는 문제가 존재하지 않는 경우
   * -해당 userId에 해당하는 협업자가 존재하지 않는 경우
   * @throws {UnprocessableDataException} 아래와 같은 경우 발생합니다.
   * -협업자의 status가 Pending이 아닌 경우
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -createdById가 해당 문제의 소유자가 아닌 경우
   */
  async rejectCollaborator(
    createdById: number,
    problemId: number,
    userId: number
  ) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId, creationMode: ProblemCreationMode.Mandeuldang },
      select: { createdById: true }
    })
    if (!problem)
      throw new EntityNotExistException('MandeuldangProblem not found')

    if (problem.createdById !== createdById) {
      throw new ForbiddenAccessException('No permission to approve/reject')
    }

    const collaborator = await this.prisma.mandeuldangCollaborator.findFirst({
      where: { problemId, userId },
      select: { id: true, status: true }
    })
    if (!collaborator)
      throw new EntityNotExistException('Collaborator not found')

    if (collaborator.status !== CollaboratorStatus.Pending) {
      throw new UnprocessableDataException('Invitation is not pending')
    }

    try {
      return await this.prisma.mandeuldangCollaborator.update({
        where: {
          id: collaborator.id,
          status: CollaboratorStatus.Pending
        },
        data: {
          status: CollaboratorStatus.Rejected,
          approvedAt: null
        }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new UnprocessableDataException(
          'Invitation state has changed. Please refresh and try again'
        )
      }

      throw error
    }
  }

  /**
   * 협업자의 role을 변경합니다.
   *
   * role : Reviewer, Editor로만 변경
   *
   * @param {number} inviterId 초대자의 id
   * @param {number} problemId 생성 문제의 id
   * @param {CollaboratorInput} input 협업자 id, role
   * @returns {mandeuldangCollaborator} 협업자 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * -해당 problemId에 해당하는 문제가 존재하지 않는 경우
   * -해당 userId에 해당하는 협업자가 존재하지 않는 경우
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -invitorId가 해당 문제의 소유자가 아닌 경우
   * @throws {UnprocessableDataException} 아래와 같은 경우 발생합니다.
   * - Owner role로 변경을 하는 경우
   * - 변경하려는 협업자가 승인하지 않는 경우
   */
  async updateCollaboratorRole(
    inviterId: number,
    problemId: number,
    input: CollaboratorUpdateInput
  ) {
    const { userId, role } = input
    if (role === CollaboratorRole.Owner) {
      throw new UnprocessableDataException('Cannot assign Owner role')
    }
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId, creationMode: ProblemCreationMode.Mandeuldang },
      select: { createdById: true }
    })
    if (!problem)
      throw new EntityNotExistException('MandeuldangProblem not found')

    const isOwner = problem.createdById === inviterId
    if (!isOwner)
      throw new ForbiddenAccessException('No permission to update role')

    if (userId === problem.createdById) {
      throw new UnprocessableDataException('Cannot change the owner role')
    }

    const collaborator = await this.prisma.mandeuldangCollaborator.findFirst({
      where: { problemId, userId },
      select: { id: true, status: true }
    })
    if (!collaborator) {
      throw new EntityNotExistException('Collaborator not found')
    }

    if (collaborator.status !== CollaboratorStatus.Approved) {
      throw new UnprocessableDataException('Collaborator is not approved')
    }

    return await this.prisma.mandeuldangCollaborator.update({
      where: { id: collaborator.id },
      data: { role }
    })
  }

  /**
   * 협업자를 제거합니다.
   * 협업자 제거는 문제 소유자만 가능합니다.
   *
   * @param {number} createdById 문제 소유자의 id
   * @param {number} problemId 생성 문제의 id
   * @param {number} userId  협업자의 id
   * @returns  {mandeuldangCollaborator} 삭제된 협업자 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * -해당 문제 소유자와 problemId에 해당하는 문제가 존재하지 않는 경우
   * -해당 userId에 대항하는 협업자가 존재하지 않는 경우
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -createdById가 해당 문제의 소유자가 아닌 경우
   */
  async removeCollaborator(
    createdById: number,
    problemId: number,
    userId: number
  ) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId, creationMode: ProblemCreationMode.Mandeuldang },
      select: { createdById: true }
    })
    if (!problem)
      throw new EntityNotExistException('MandeuldangProblem not found')

    if (userId === problem.createdById) {
      throw new UnprocessableDataException('Cannot remove the owner')
    }

    if (problem.createdById !== createdById) {
      throw new ForbiddenAccessException('No permission to remove collaborator')
    }

    const collaborator = await this.prisma.mandeuldangCollaborator.findFirst({
      where: {
        problemId,
        userId,
        status: CollaboratorStatus.Approved
      },
      select: { id: true }
    })
    if (!collaborator) {
      throw new EntityNotExistException('Collaborator not found')
    }
    return await this.prisma.mandeuldangCollaborator.delete({
      where: { id: collaborator.id }
    })
  }
}
