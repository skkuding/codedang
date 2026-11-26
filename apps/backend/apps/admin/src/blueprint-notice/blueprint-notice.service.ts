import { Injectable } from '@nestjs/common'
import {
  Prisma,
  type BlueprintNotice,
  type BlueprintNoticeSave
} from '@prisma/client'
import { createHash } from 'crypto'
import type { AuthenticatedUser } from '@libs/auth'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import type {
  CreateBlueprintNoticeInput,
  UpdateBlueprintNoticeInput
} from './model/blueprint-notice.input'

const contentInclude = {
  courseNotice: { orderBy: { groupId: 'asc' as const } }
} satisfies Prisma.BlueprintNoticeInclude

@Injectable()
export class BlueprintNoticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BlueprintAccessService
  ) {}

  /**
   * Creates a blueprint notice source and a CourseNotice copy for each selected section.
   *
   * - Saves the source, every copy and the success receipt in one transaction. Any failure rolls back everything.
   * - Resending the same request with the same operationId returns the saved result without creating again.
   * - Copies start public (isPublic = true) and unpinned (isFixed = false); sections manage them afterwards.
   *
   * @returns The created source and its linked copies
   * @throws EntityNotExistException - The blueprint does not exist.
   * @throws ForbiddenAccessException - The user is not a blueprint leader.
   * @throws UnprocessableDataException - A section belongs to another blueprint, or the operationId was used by another request.
   */
  async createNotice(
    user: AuthenticatedUser,
    blueprintCourseId: number,
    input: CreateBlueprintNoticeInput
  ) {
    await this.access.assertBlueprintLeader(user, blueprintCourseId)
    const { operationId, title, content, sectionGroupIds } = input
    const requestHash = this.hashRequest({ blueprintCourseId, input })

    return await this.saveOnce(
      user,
      blueprintCourseId,
      operationId,
      requestHash,
      async (tx) => {
        await this.assertSectionsBelong(tx, blueprintCourseId, sectionGroupIds)
        const source = await tx.blueprintNotice.create({
          data: { blueprintCourseId, createdById: user.id, title, content }
        })
        await tx.courseNotice.createMany({
          data: [...sectionGroupIds]
            .sort((a, b) => a - b)
            .map((groupId) => ({
              groupId,
              createdById: user.id,
              title,
              content,
              isPublic: true,
              isFixed: false,
              blueprintNoticeId: source.id
            }))
        })
        return source
      }
    )
  }

  /**
   * Updates a blueprint notice source and applies the given shared content to all currently linked copies.
   *
   * - Locks the source row, compares the revision, and increments it on success.
   * - Resets the read records (readBy) of the copies only when the title or content actually changes.
   * - Visibility and pinning of copies belong to sections and are not changed. Unlinked copies are not updated.
   *
   * @returns The updated source and its linked copies
   * @throws EntityNotExistException - The notice or the blueprint does not exist.
   * @throws ForbiddenAccessException - The user is not a blueprint leader.
   * @throws UnprocessableDataException - No field is given, the revision is stale, or the operationId was used by another request.
   */
  async updateNotice(
    user: AuthenticatedUser,
    blueprintNoticeId: number,
    input: UpdateBlueprintNoticeInput
  ) {
    const blueprintCourseId = await this.findCourseId(blueprintNoticeId)
    await this.access.assertBlueprintLeader(user, blueprintCourseId)
    const { operationId, expectedRevision, title, content } = input
    if (title === undefined && content === undefined)
      throw new UnprocessableDataException(
        'At least one of title or content must be provided'
      )
    const requestHash = this.hashRequest({
      blueprintCourseId,
      id: blueprintNoticeId,
      input
    })

    return await this.saveOnce(
      user,
      blueprintCourseId,
      operationId,
      requestHash,
      async (tx) => {
        await this.lockNotice(tx, blueprintNoticeId)
        const current = await tx.blueprintNotice.findFirst({
          where: { id: blueprintNoticeId, blueprintCourseId }
        })
        if (!current) throw new EntityNotExistException('BlueprintNotice')
        if (current.revision !== expectedRevision)
          throw new UnprocessableDataException(
            'STALE_REVISION: reload the notice before saving'
          )

        const data = {
          ...(title !== undefined ? { title } : {}),
          ...(content !== undefined ? { content } : {})
        }
        const isContentChanged =
          (title !== undefined && title !== current.title) ||
          (content !== undefined && content !== current.content)

        const source = await tx.blueprintNotice.update({
          where: { id: blueprintNoticeId },
          data: { ...data, revision: { increment: 1 } }
        })
        await tx.courseNotice.updateMany({
          where: { blueprintNoticeId },
          data: {
            ...data,
            ...(isContentChanged ? { readBy: { set: [] } } : {})
          }
        })
        return source
      }
    )
  }

  /**
   * Unlinks a section copy from its source. Later source edits no longer apply to this copy,
   * and the section can edit its title and content directly. This cannot be undone.
   *
   * Locks the source row first to serialize with ongoing source edits. An already unlinked notice is returned as is.
   *
   * @returns id, groupId and blueprintNoticeId (null) of the unlinked notice
   * @throws EntityNotExistException - The section has no such notice.
   */
  async unlink(groupId: number, courseNoticeId: number) {
    const select = { id: true, groupId: true, blueprintNoticeId: true }
    return await this.prisma.$transaction(async (tx) => {
      const copy = await tx.courseNotice.findFirst({
        where: { id: courseNoticeId, groupId },
        select
      })
      if (!copy) throw new EntityNotExistException('CourseNotice')
      if (copy.blueprintNoticeId == null) return copy

      await this.lockNotice(tx, copy.blueprintNoticeId)
      return await tx.courseNotice.update({
        where: { id: courseNoticeId, groupId },
        data: { blueprintNoticeId: null },
        select
      })
    })
  }

  /**
   * @returns Blueprint notices with their linked copies, newest ID first.
   * @throws EntityNotExistException - The blueprint does not exist.
   * @throws ForbiddenAccessException - The user is not a blueprint leader.
   * @throws UnprocessableDataException - take is outside 1 to 100.
   */
  async getNotices(
    user: AuthenticatedUser,
    blueprintCourseId: number,
    take = 10,
    cursor?: number | null,
    search?: string
  ) {
    await this.access.assertBlueprintLeader(user, blueprintCourseId)
    if (!Number.isInteger(take) || take < 1 || take > 100)
      throw new UnprocessableDataException('take must be between 1 and 100')

    return await this.prisma.blueprintNotice.findMany({
      where: {
        blueprintCourseId,
        ...(cursor ? { id: { lt: cursor } } : {}),
        ...(search ? { title: { contains: search, mode: 'insensitive' } } : {})
      },
      orderBy: { id: 'desc' },
      take,
      include: contentInclude
    })
  }

  /**
   * @returns The blueprint notice source and its linked copies
   * @throws EntityNotExistException - The notice or the blueprint does not exist.
   * @throws ForbiddenAccessException - The user is not a blueprint leader.
   */
  async getNoticeById(user: AuthenticatedUser, blueprintNoticeId: number) {
    const blueprintCourseId = await this.findCourseId(blueprintNoticeId)
    await this.access.assertBlueprintLeader(user, blueprintCourseId)

    const notice = await this.prisma.blueprintNotice.findFirst({
      where: { id: blueprintNoticeId, blueprintCourseId },
      include: contentInclude
    })
    // A notice deleted after the access check is also NOT_FOUND.
    if (!notice) throw new EntityNotExistException('BlueprintNotice')
    return notice
  }

  private async findCourseId(blueprintNoticeId: number) {
    const notice = await this.prisma.blueprintNotice.findUnique({
      where: { id: blueprintNoticeId },
      select: { blueprintCourseId: true }
    })
    if (!notice) throw new EntityNotExistException('BlueprintNotice')
    return notice.blueprintCourseId
  }

  /**
   * Runs a successful request only once.
   *
   * Concurrent requests with the same operationId are serialized by an advisory lock. If a success receipt exists,
   * it checks that the request is the same and returns the current state without running again. Otherwise it runs apply
   * and records the receipt in the same transaction, so a failed request rolls back without a receipt.
   */
  private async saveOnce(
    user: AuthenticatedUser,
    blueprintCourseId: number,
    operationId: string,
    requestHash: string,
    apply: (tx: Prisma.TransactionClient) => Promise<BlueprintNotice>
  ) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${operationId}, 0))::text`
      const receipt = await tx.blueprintNoticeSave.findUnique({
        where: { id: operationId }
      })
      if (receipt) {
        this.assertReceipt(receipt, user.id, blueprintCourseId, requestHash)
        return await tx.blueprintNotice.findFirstOrThrow({
          where: { id: receipt.blueprintNoticeId, blueprintCourseId },
          include: contentInclude
        })
      }

      const source = await apply(tx)
      await tx.blueprintNoticeSave.create({
        data: {
          id: operationId,
          userId: user.id,
          blueprintCourseId,
          blueprintNoticeId: source.id,
          revision: source.revision,
          requestHash
        }
      })
      return await tx.blueprintNotice.findUniqueOrThrow({
        where: { id: source.id },
        include: contentInclude
      })
    })
  }

  private hashRequest(request: object) {
    return createHash('sha256').update(JSON.stringify(request)).digest('hex')
  }

  private async lockNotice(tx: Prisma.TransactionClient, id: number) {
    await tx.$queryRaw`SELECT id FROM blueprint_notice WHERE id = ${id} FOR UPDATE`
  }

  private assertReceipt(
    receipt: BlueprintNoticeSave,
    userId: number,
    blueprintCourseId: number,
    requestHash: string
  ) {
    if (
      receipt.userId !== userId ||
      receipt.blueprintCourseId !== blueprintCourseId ||
      receipt.requestHash !== requestHash
    )
      throw new UnprocessableDataException(
        'Operation ID belongs to another request'
      )
  }

  private async assertSectionsBelong(
    tx: Prisma.TransactionClient,
    blueprintCourseId: number,
    groupIds: number[]
  ) {
    const owned = await tx.courseInfo.count({
      where: { blueprintCourseId, groupId: { in: groupIds } }
    })
    if (owned !== new Set(groupIds).size)
      throw new UnprocessableDataException(
        'All sections must belong to this Blueprint'
      )
  }
}
