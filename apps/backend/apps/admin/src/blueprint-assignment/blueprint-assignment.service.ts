import { Injectable } from '@nestjs/common'
import {
  Prisma,
  type BlueprintAssignment,
  type BlueprintAssignmentSave
} from '@prisma/client'
import { createHash } from 'crypto'
import type { AuthenticatedUser } from '@libs/auth'
import {
  UnprocessableDataException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  AssignmentEventService,
  type AssignmentLifecycleEvent
} from '@admin/assignment/assignment-event.service'
import { lockBlueprintAssignment } from '@admin/assignment/assignment-link'
import { lockAssignmentProblems } from '@admin/assignment/assignment-problem-access'
import {
  resolveAssignmentSectionSettings,
  updateAssignmentSectionSettings
} from '@admin/assignment/assignment-section-settings'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import type {
  CreateBlueprintAssignmentInput,
  BlueprintAssignmentSectionInput,
  UpdateBlueprintAssignmentInput,
  BlueprintAssignmentSectionUpdateInput
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

  async getAssignments(
    user: AuthenticatedUser,
    blueprintCourseId: number,
    isExercise = false,
    take = 10,
    cursor?: number,
    search?: string
  ) {
    await this.access.assertBlueprintLeader(user, blueprintCourseId)
    if (!Number.isInteger(take) || take < 1 || take > 100)
      throw new UnprocessableDataException('take must be between 1 and 100')
    const rows = await this.prisma.blueprintAssignment.findMany({
      where: {
        blueprintCourseId,
        isExercise,
        ...(cursor ? { id: { lt: cursor } } : {}),
        ...(search ? { title: { contains: search, mode: 'insensitive' } } : {})
      },
      orderBy: { id: 'desc' },
      take,
      include: this.contentInclude
    })
    return rows.map((row) => this.output(row))
  }

  async getAssignment(
    user: AuthenticatedUser,
    blueprintCourseId: number,
    id: number
  ) {
    await this.access.assertBlueprintLeader(user, blueprintCourseId)
    return this.output(
      await this.prisma.blueprintAssignment.findFirstOrThrow({
        where: { id, blueprintCourseId },
        include: this.contentInclude
      })
    )
  }

  private async findCourseId(id: number) {
    const source = await this.prisma.blueprintAssignment.findUnique({
      where: { id },
      select: { blueprintCourseId: true }
    })
    if (!source) throw new EntityNotExistException('BlueprintAssignment')
    return source.blueprintCourseId
  }

  async getAssignmentById(user: AuthenticatedUser, id: number) {
    return this.getAssignment(user, await this.findCourseId(id), id)
  }

  async updateAssignmentById(
    user: AuthenticatedUser,
    id: number,
    input: UpdateBlueprintAssignmentInput
  ) {
    return this.save(user, await this.findCourseId(id), input, id)
  }

  async save(
    user: AuthenticatedUser,
    blueprintCourseId: number,
    input: CreateBlueprintAssignmentInput | UpdateBlueprintAssignmentInput,
    id?: number
  ) {
    await this.access.assertBlueprintLeader(user, blueprintCourseId)
    const requestHash = createHash('sha256')
      .update(JSON.stringify({ blueprintCourseId, id, input }))
      .digest('hex')
    const pending: AssignmentLifecycleEvent[] = []
    const saved = await this.prisma.$transaction(
      async (tx) => {
        // A failed save leaves no receipt; a successful duplicate never reapplies content.
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
        await this.validate(tx, blueprintCourseId, input, id === undefined)
        const { operationId, sections, ...raw } = input
        const { expectedRevision, ...content } = raw as typeof raw & {
          expectedRevision?: number
        }
        const copies = new Map<
          number,
          Prisma.AssignmentGetPayload<{
            include: { assignmentProblem: true }
          }>
        >()
        let source: BlueprintAssignment
        if (id !== undefined) {
          await lockBlueprintAssignment(tx, id)
          const current = await tx.blueprintAssignment.findFirstOrThrow({
            where: { id, blueprintCourseId },
            include: { assignment: { include: { assignmentProblem: true } } }
          })
          if (current.revision !== expectedRevision)
            throw new UnprocessableDataException(
              'STALE_REVISION: reload the assignment before saving'
            )
          const linkedIds = new Set(
            current.assignment.map((copy) => copy.groupId)
          )
          if (
            (sections ?? []).some((section) => !linkedIds.has(section.groupId))
          )
            throw new UnprocessableDataException(
              'Section settings can only update currently linked copies'
            )
          if (
            content.isExercise !== undefined &&
            content.isExercise !== current.isExercise
          )
            throw new UnprocessableDataException(
              'Assignment type cannot change'
            )
          for (const copy of current.assignment) copies.set(copy.groupId, copy)
          source = await tx.blueprintAssignment.update({
            where: { id },
            data: { ...content, revision: { increment: 1 } }
          })
        } else {
          const createInput = input as CreateBlueprintAssignmentInput
          source = await tx.blueprintAssignment.create({
            data: {
              ...content,
              title: createInput.title,
              description: createInput.description,
              week: createInput.week,
              isVisible: createInput.isVisible,
              isRankVisible: createInput.isRankVisible,
              isJudgeResultVisible: createInput.isJudgeResultVisible,
              blueprintCourseId,
              createdById: user.id
            }
          })
        }
        // Existing problem rows are read only here. Problem mutations own composition.
        // Schedule changes still need to recalculate visibility under the same locks.
        await lockAssignmentProblems(
          tx,
          Array.from(copies.values())
            .filter((copy) => {
              const nextEndTime = sections?.find(
                (section) => section.groupId === copy.groupId
              )?.endTime
              return (
                nextEndTime !== undefined &&
                nextEndTime.getTime() !== copy.endTime.getTime()
              )
            })
            .flatMap((copy) =>
              copy.assignmentProblem.map((problem) => problem.problemId)
            )
        )
        const patches = new Map(
          (sections ?? []).map((section) => [section.groupId, section])
        )
        const groupIds =
          id === undefined
            ? Array.from(patches.keys())
            : Array.from(copies.keys())
        for (const groupId of groupIds.sort((a, b) => a - b)) {
          await this.applySection(
            tx,
            source,
            groupId,
            patches.get(groupId),
            user.id,
            pending,
            copies.get(groupId)
          )
        }
        // This is a completed-request receipt, never a partial-success or retry queue.
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
    // A rolled-back save cannot publish any of its queued events.
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
    input: CreateBlueprintAssignmentInput | UpdateBlueprintAssignmentInput,
    isCreate: boolean
  ) {
    const createInput = input as CreateBlueprintAssignmentInput
    if (
      isCreate &&
      (input.title === undefined ||
        input.description === undefined ||
        input.week === undefined ||
        input.sections === undefined)
    )
      throw new UnprocessableDataException(
        'Create requires content and section schedules'
      )
    for (const key of [
      'isVisible',
      'isRankVisible',
      'isJudgeResultVisible'
    ] as const) {
      if (isCreate && typeof createInput[key] !== 'boolean')
        throw new UnprocessableDataException(`${key} must be a boolean`)
      if (!isCreate && createInput[key] !== undefined)
        throw new UnprocessableDataException(`${key} must be set per section`)
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
    if (isCreate && sections.length === 0)
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
    patch:
      | BlueprintAssignmentSectionInput
      | BlueprintAssignmentSectionUpdateInput
      | undefined,
    userId: number,
    pending: AssignmentLifecycleEvent[],
    previous?: Prisma.AssignmentGetPayload<{
      include: { assignmentProblem: true }
    }>
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
    if (previous) {
      await updateAssignmentSectionSettings(
        tx,
        previous,
        patch ?? {},
        pending,
        content
      )
      return
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

  async unlink(groupId: number, assignmentId: number) {
    return this.prisma.$transaction(async (tx) => {
      const copy = await tx.assignment.findFirst({
        where: { id: assignmentId, groupId }
      })
      if (!copy) throw new EntityNotExistException('Assignment')
      if (copy.blueprintAssignmentId == null) return copy
      await lockBlueprintAssignment(tx, copy.blueprintAssignmentId)
      return tx.assignment.update({
        where: { id: assignmentId, groupId },
        data: { blueprintAssignmentId: null }
      })
    })
  }
}
