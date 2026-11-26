import { Injectable } from '@nestjs/common'
import { Prisma, type BlueprintNoticeSave } from '@prisma/client'
import { createHash } from 'crypto'
import type { AuthenticatedUser } from '@libs/auth'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import type { CreateBlueprintNoticeInput } from './model/blueprint-notice.input'

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
    const requestHash = createHash('sha256')
      .update(JSON.stringify({ blueprintCourseId, input }))
      .digest('hex')

    return await this.prisma.$transaction(async (tx) => {
      // Serialize concurrent requests with the same operationId.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${input.operationId}, 0))::text`
      const receipt = await tx.blueprintNoticeSave.findUnique({
        where: { id: input.operationId }
      })
      if (receipt) {
        this.assertReceipt(receipt, user.id, blueprintCourseId, requestHash)
        return await tx.blueprintNotice.findFirstOrThrow({
          where: { id: receipt.blueprintNoticeId, blueprintCourseId },
          include: contentInclude
        })
      }

      const { operationId, title, content, sectionGroupIds } = input
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
      // Only successful requests leave a receipt; a failure rolls it back too.
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
