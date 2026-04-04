import { Injectable } from '@nestjs/common'
import { CollaboratorRole, CollaboratorStatus } from '@prisma/client'
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
   * 해당 polygon 문제에 협업자를 초대합니다.
   *
   * 협업자 초대는 1. 해당 문제의 소유자 2. status: Active, role:Editor 인 경우에만 가능
   *
   * @param {number} inviterId 초대자의 id
   * @param {number} polygonId 생성 문제의 id
   * @param {CollaboratorInput} model 협업자 id, role
   * @returns {polygonCollaborator} 협업자 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * -해당 polygonId에 해당하는 문제가 존재하지 않는 경우
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -초대자가 문제의 소유자가 아니면서 status: Active, role:Editor가 아닌 경우
   * @throws {DuplicateFoundException} 아래와 같은 경우 발생합니다.
   * -이미 초대된 협업자를 초대한 경우
   * -문제 소유자를 초대한 경우
   */
  async inviteCollaborator(
    inviterId: number,
    polygonId: number,
    input: CollaboratorInput
  ) {
    const { userEmail, role } = input
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true }
    })
    if (!user) {
      throw new EntityNotExistException('User not found')
    }
    const userId = user.id

    const problem = await this.prisma.polygonProblem.findUnique({
      where: { id: polygonId },
      select: { createdById: true }
    })
    if (!problem) throw new EntityNotExistException('PolygonProblem not found')

    const isOwner = problem.createdById === inviterId

    if (!isOwner) {
      const inviterInfo = await this.prisma.polygonCollaborator.findFirst({
        where: {
          problemId: polygonId,
          userId: inviterId
        },
        select: { status: true, role: true }
      })
      const canInvite =
        inviterInfo?.status === CollaboratorStatus.Active &&
        inviterInfo?.role === CollaboratorRole.Editor
      if (!canInvite) {
        throw new ForbiddenAccessException(
          'No permission to invite collaborator'
        )
      }
    }

    const existing = await this.prisma.polygonCollaborator.findFirst({
      where: {
        problemId: polygonId,
        userId
      },
      select: { id: true }
    })
    if (existing || userId === problem.createdById) {
      throw new DuplicateFoundException('Collaborator')
    }
    const status = isOwner
      ? CollaboratorStatus.Active
      : CollaboratorStatus.Pending

    return await this.prisma.polygonCollaborator.create({
      data: {
        problemId: polygonId,
        userId,
        role,
        status
      }
    })
  }

  /**
   * Status에 따른 협업자 목록을 반환합니다.
   *
   * status : Pending(수락 대기 중), Active(활성화 됨)
   *
   * @param {number} polygonId 생성 문제의 id
   * @param {CollaboratorStatus} status 협업자의 상태
   * @returns {olygonCollaborator[]} 협업자 목록
   */
  async getCollaboratorsByStatus(
    polygonId: number,
    status: CollaboratorStatus
  ) {
    const collaborators = await this.prisma.polygonCollaborator.findMany({
      where: {
        problemId: polygonId,
        status
      },
      select: {
        role: true,
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
      role: c.role
    }))
  }

  /**
   * 문제 소유자가 협업 요청을 수락합니다.
   *
   * @param {number} createdById 문제 소유자의 id
   * @param {number} polygonId 생성 문제의 id
   * @param {number} userId 협업자의 id
   * @returns {polygonCollaborator} 협업자 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * -해당 polygonId에 해당하는 문제가 존재하지 않는 경우
   * -해당 userId에 해당하는 협업자가 존재하지 않는 경우
   * @throws {UnprocessableDataException} 아래와 같은 경우 발생합니다.
   * -협업자의 status가 Pending이 아닌 경우
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -createdById가 해당 문제의 소유자가 아닌 경우
   */
  async approveCollaborator(
    createdById: number,
    polygonId: number,
    userId: number
  ) {
    const problem = await this.prisma.polygonProblem.findUnique({
      where: { id: polygonId },
      select: { createdById: true }
    })
    if (!problem) throw new EntityNotExistException('PolygonProblem not found')

    if (problem.createdById !== createdById) {
      throw new ForbiddenAccessException('No permission to approve/reject')
    }
    const collaborator = await this.prisma.polygonCollaborator.findFirst({
      where: { problemId: polygonId, userId },
      select: { id: true, status: true }
    })
    if (!collaborator) {
      throw new EntityNotExistException('Collaborator not found')
    }

    if (collaborator.status !== CollaboratorStatus.Pending) {
      throw new UnprocessableDataException('Invitation is not pending')
    }

    return await this.prisma.polygonCollaborator.update({
      where: { id: collaborator.id },
      data: { status: CollaboratorStatus.Active }
    })
  }

  /**
   * 문제 소유자가 협업 요청을 거절합니다.
   *
   * @param {number} createdById 문제 소유자의 id
   * @param {number} polygonId 생성 문제의 id
   * @param {number} userId 협업자의 id
   * @returns {polygonCollaborator} 삭제 협업자 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * -해당 polygonId에 해당하는 문제가 존재하지 않는 경우
   * -해당 userId에 해당하는 협업자가 존재하지 않는 경우
   * @throws {UnprocessableDataException} 아래와 같은 경우 발생합니다.
   * -협업자의 status가 Pending이 아닌 경우
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -createdById가 해당 문제의 소유자가 아닌 경우
   */
  async rejectCollaborator(
    createdById: number,
    polygonId: number,
    userId: number
  ) {
    const problem = await this.prisma.polygonProblem.findUnique({
      where: { id: polygonId },
      select: { createdById: true }
    })
    if (!problem) throw new EntityNotExistException('PolygonProblem not found')

    if (problem.createdById !== createdById) {
      throw new ForbiddenAccessException('No permission to approve/reject')
    }

    const collaborator = await this.prisma.polygonCollaborator.findFirst({
      where: { problemId: polygonId, userId },
      select: { id: true, status: true }
    })
    if (!collaborator)
      throw new EntityNotExistException('Collaborator not found')

    if (collaborator.status !== CollaboratorStatus.Pending) {
      throw new UnprocessableDataException('Invitation is not pending')
    }

    return await this.prisma.polygonCollaborator.delete({
      where: { id: collaborator.id }
    })
  }

  /**
   * 협업자의 role을 변경합니다.
   *
   * role : Viewer, Editor로만 변경
   *
   * @param {number} inviterId 초대자의 id
   * @param {number} polygonId 생성 문제의 id
   * @param {CollaboratorInput} input 협업자 id, role
   * @returns {polygonCollaborator} 협업자 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * -해당 polygonId에 해당하는 문제가 존재하지 않는 경우
   * -해당 userId에 해당하는 협업자가 존재하지 않는 경우
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -invitorId가 해당 문제의 소유자가 아닌 경우
   */
  async updateCollaboratorRole(
    inviterId: number,
    polygonId: number,
    input: CollaboratorUpdateInput
  ) {
    const { userId, role } = input
    const problem = await this.prisma.polygonProblem.findUnique({
      where: { id: polygonId },
      select: { createdById: true }
    })
    if (!problem) throw new EntityNotExistException('PolygonProblem not found')

    const isOwner = problem.createdById === inviterId
    if (!isOwner)
      throw new ForbiddenAccessException('No permission to update role')

    const collaborator = await this.prisma.polygonCollaborator.findFirst({
      where: { problemId: polygonId, userId },
      select: { id: true, status: true }
    })
    if (!collaborator) {
      throw new EntityNotExistException('Collaborator not found')
    }
    return await this.prisma.polygonCollaborator.update({
      where: { id: collaborator.id },
      data: { role }
    })
  }

  /**
   * 협업자를 제거합니다.
   * 협업자 제거는 문제 소유자만 가능합니다.
   *
   * @param {number} createdById 문제 소유자의 id
   * @param {number} polygonId 생성 문제의 id
   * @param {number} userId  협업자의 id
   * @returns  {polygonCollaborator} 삭제된 협업자 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * -해당 문제 소유자와 polygonId에 해당하는 문제가 존재하지 않는 경우
   * -해당 userId에 대항하는 협업자가 존재하지 않는 경우
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -createdById가 해당 문제의 소유자가 아닌 경우
   */
  async removeCollaborator(
    createdById: number,
    polygonId: number,
    userId: number
  ) {
    const problem = await this.prisma.polygonProblem.findUnique({
      where: { id: polygonId },
      select: { createdById: true }
    })
    if (!problem) throw new EntityNotExistException('PolygonProblem not found')

    if (problem.createdById !== createdById) {
      throw new ForbiddenAccessException('No permission to remove collaborator')
    }

    const collaborator = await this.prisma.polygonCollaborator.findFirst({
      where: { problemId: polygonId, userId },
      select: { id: true }
    })
    if (!collaborator) {
      throw new EntityNotExistException('Collaborator not found')
    }
    return await this.prisma.polygonCollaborator.delete({
      where: { id: collaborator.id }
    })
  }
}
