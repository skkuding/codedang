import { Injectable } from '@nestjs/common'
import {
  Prisma,
  type BlueprintAssignment,
  type BlueprintAssignmentSave
} from '@prisma/client'
import { createHash } from 'crypto'
import type { AuthenticatedUser } from '@libs/auth'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  AssignmentEventService,
  type AssignmentLifecycleEvent
} from '@admin/assignment/assignment-event.service'
import { lockBlueprintAssignment } from '@admin/assignment/assignment-link'
import { resolveAssignmentSectionSettings } from '@admin/assignment/assignment-section-settings'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import type {
  CreateBlueprintAssignmentInput,
  BlueprintAssignmentSectionInput
} from './model/blueprint-assignment.input'

@Injectable()
export class BlueprintAssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BlueprintAccessService,
    private readonly events: AssignmentEventService
  ) {}

  private readonly contentInclude = {
    blueprintAssignmentProblem: { orderBy: { order: 'asc' as const } },
    assignment: {
      orderBy: { groupId: 'asc' as const },
      include: { assignmentProblem: { orderBy: { order: 'asc' as const } } }
    }
  }

  private output(
    row: Prisma.BlueprintAssignmentGetPayload<{
      include: BlueprintAssignmentService['contentInclude']
    }>
  ) {
    const { blueprintAssignmentProblem, assignment, ...source } = row
    const copies = assignment.map(({ assignmentProblem, ...copy }) => ({
      ...copy,
      problems: assignmentProblem
    }))
    return {
      ...source,
      blueprintAssignmentProblem,
      assignment: copies
    }
  }

  async save(
    user: AuthenticatedUser,
    blueprintCourseId: number,
    input: CreateBlueprintAssignmentInput
  ) {
    await this.access.assertBlueprintLeader(user, blueprintCourseId)
    const requestHash = createHash('sha256')
      .update(JSON.stringify({ blueprintCourseId, id: undefined, input }))
      .digest('hex')
    const pending: AssignmentLifecycleEvent[] = []
    const saved = await this.prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${input.operationId}, 0))::text`
        const receipt = await tx.blueprintAssignmentSave.findUnique({
          where: { id: input.operationId }
        })
        if (receipt) {
          this.assertReceipt(receipt, user.id, blueprintCourseId, requestHash)
          await lockBlueprintAssignment(tx, receipt.blueprintAssignmentId)
          return this.output(
            await tx.blueprintAssignment.findFirstOrThrow({
              where: { id: receipt.blueprintAssignmentId, blueprintCourseId },
              include: this.contentInclude
            })
          )
        }
        await this.validate(tx, blueprintCourseId, input)
        const { operationId, sections, ...content } = input
        const source = await tx.blueprintAssignment.create({
          data: { ...content, blueprintCourseId, createdById: user.id }
        })
        for (const section of [...sections].sort(
          (a, b) => a.groupId - b.groupId
        ))
          await this.applySection(
            tx,
            source,
            section.groupId,
            section,
            user.id,
            pending
          )
        await tx.blueprintAssignmentSave.create({
          data: {
            id: operationId,
            userId: user.id,
            blueprintCourseId,
            blueprintAssignmentId: source.id,
            revision: source.revision,
            requestHash
          }
        })
        return this.output(
          await tx.blueprintAssignment.findUniqueOrThrow({
            where: { id: source.id },
            include: this.contentInclude
          })
        )
      },
      { timeout: 30000 }
    )
    await this.events.publish(pending)
    return saved
  }

  private assertReceipt(
    receipt: BlueprintAssignmentSave,
    userId: number,
    blueprintCourseId: number,
    requestHash?: string
  ) {
    if (
      receipt.userId !== userId ||
      receipt.blueprintCourseId !== blueprintCourseId ||
      (requestHash && receipt.requestHash !== requestHash)
    )
      throw new UnprocessableDataException(
        'Operation ID belongs to another request'
      )
  }

  private async validate(
    tx: Prisma.TransactionClient,
    blueprintCourseId: number,
    input: CreateBlueprintAssignmentInput
  ) {
    const createInput = input as CreateBlueprintAssignmentInput
    if (
      input.title === undefined ||
      input.description === undefined ||
      input.week === undefined ||
      input.sections === undefined
    )
      throw new UnprocessableDataException(
        'Create requires content and section schedules'
      )
    for (const key of [
      'isVisible',
      'isRankVisible',
      'isJudgeResultVisible'
    ] as const) {
      if (typeof createInput[key] !== 'boolean')
        throw new UnprocessableDataException(`${key} must be a boolean`)
    }
    const course = await tx.blueprintCourse.findUniqueOrThrow({
      where: { id: blueprintCourseId }
    })
    if (
      input.title !== undefined &&
      (typeof input.title !== 'string' ||
        !input.title.trim() ||
        input.title.trim().length > 120)
    )
      throw new UnprocessableDataException(
        'Title must contain 1 to 120 characters'
      )
    if (
      input.description !== undefined &&
      (typeof input.description !== 'string' || !input.description.trim())
    )
      throw new UnprocessableDataException('Description is required')
    if (
      input.week !== undefined &&
      (!Number.isInteger(input.week) ||
        input.week < 1 ||
        input.week > course.week)
    )
      throw new UnprocessableDataException('Invalid week')
    for (const key of [
      'enableCopyPaste',
      'autoFinalizeScore',
      'isExercise'
    ] as const) {
      if (input[key] !== undefined && typeof input[key] !== 'boolean')
        throw new UnprocessableDataException(`${key} must be a boolean`)
    }
    if (
      input.sections === null ||
      (input.sections !== undefined && !Array.isArray(input.sections))
    )
      throw new UnprocessableDataException('sections must be an array')
    const sections = input.sections ?? []
    if (sections.length === 0)
      throw new UnprocessableDataException('Select at least one section')
    if (
      new Set(sections.map((section) => section.groupId)).size !==
      sections.length
    )
      throw new UnprocessableDataException('Duplicate section')
    const owned = await tx.courseInfo.count({
      where: {
        blueprintCourseId,
        groupId: { in: sections.map((section) => section.groupId) }
      }
    })
    if (owned !== sections.length)
      throw new UnprocessableDataException(
        'All sections must belong to this Blueprint'
      )
  }

  private async applySection(
    tx: Prisma.TransactionClient,
    source: BlueprintAssignment,
    groupId: number,
    patch: BlueprintAssignmentSectionInput,
    userId: number,
    pending: AssignmentLifecycleEvent[]
  ) {
    const section = await tx.courseInfo.findFirst({
      where: { groupId, blueprintCourseId: source.blueprintCourseId }
    })
    if (!section)
      throw new UnprocessableDataException(
        'Section no longer belongs to Blueprint'
      )
    const content = {
      title: source.title,
      description: source.description,
      week: source.week,
      enableCopyPaste: source.enableCopyPaste,
      autoFinalizeScore: source.autoFinalizeScore,
      isExercise: source.isExercise
    }
    const defaults = {
      startTime: patch?.startTime as Date,
      endTime: patch?.endTime as Date,
      dueTime: patch?.dueTime ?? null,
      isVisible: source.isVisible,
      isRankVisible: source.isRankVisible,
      isJudgeResultVisible: source.isJudgeResultVisible,
      isFinalScoreVisible: false
    }
    const settings = resolveAssignmentSectionSettings(defaults, patch ?? {})
    const copy = await tx.assignment.create({
      data: {
        ...content,
        ...defaults,
        ...settings,
        groupId,
        createdById: userId,
        blueprintAssignmentId: source.id
      }
    })
    const members = await tx.userGroup.findMany({
      where: { groupId },
      select: { userId: true }
    })
    await tx.assignmentRecord.createMany({
      data: members.map(({ userId }) => ({ userId, assignmentId: copy.id })),
      skipDuplicates: true
    })
    pending.push({
      name: 'assignment.created',
      assignmentId: copy.id,
      dueTime: copy.dueTime ?? copy.endTime
    })
  }
}
