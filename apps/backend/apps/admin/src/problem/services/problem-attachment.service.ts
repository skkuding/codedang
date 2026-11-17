import { Injectable } from '@nestjs/common'
import { FileStatus, type Prisma } from '@prisma/client'
import { AttachmentService } from '@libs/attachment'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

export const PROBLEM_ATTACHMENT_FIELDS = [
  'description',
  'inputDescription',
  'outputDescription'
] as const

export type ProblemAttachmentField = (typeof PROBLEM_ATTACHMENT_FIELDS)[number]

export type ProblemAttachmentFields = Partial<
  Record<ProblemAttachmentField, string | null | undefined>
>

type TransactionClient = Prisma.TransactionClient

@Injectable()
export class ProblemAttachmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attachmentService: AttachmentService
  ) {}

  extractIds(fields: ProblemAttachmentFields): string[] {
    return this.attachmentService.extractIds(this.toHtmls(fields))
  }

  assertNoStorageUrl(fields: ProblemAttachmentFields): void {
    this.attachmentService.assertNoStorageUrl(this.toHtmls(fields))
  }

  /**
   * Rejects the fields when a Temporary or Attached file is referenced in any
   * form other than a parsed data-attachment-id (a storage URL, or an ID the
   * parser cannot read). Those references would skip ownership checks and
   * would not be tracked when the body changes. Legacy Unmanaged files pass.
   */
  async assertAttachmentsReferencedById(
    tx: TransactionClient,
    fields: ProblemAttachmentFields
  ): Promise<void> {
    const htmls = this.toHtmls(fields)
    const parsedIds = new Set(
      this.attachmentService.extractIds(htmls).map((id) => id.toLowerCase())
    )
    const candidates = new Set([
      ...this.attachmentService.extractStorageFilenames(htmls),
      ...this.attachmentService
        .findUuids(htmls)
        .filter((uuid) => !parsedIds.has(uuid))
    ])
    if (!candidates.size) return

    const managed = await tx.file.findMany({
      where: {
        filename: { in: [...candidates] },
        status: { in: [FileStatus.Temporary, FileStatus.Attached] }
      },
      select: { filename: true }
    })
    if (managed.length) {
      throw new UnprocessableDataException(
        `Attachments must be referenced by data-attachment-id: ${managed
          .map(({ filename }) => filename)
          .join(', ')}`
      )
    }
  }

  /**
   * Accepts an ID only if it is already attached to this problem or is a
   * Temporary file uploaded by the user; the latter is switched to Attached.
   */
  async attach(
    tx: TransactionClient,
    args: { problemId: number; userId: number; ids: string[] }
  ): Promise<void> {
    const { problemId, userId, ids } = args
    if (!ids.length) return

    const files = await tx.file.findMany({
      where: { filename: { in: ids } },
      select: {
        filename: true,
        status: true,
        problemId: true,
        createdById: true
      }
    })
    const fileMap = new Map(files.map((file) => [file.filename, file]))

    const toAttach: string[] = []
    const rejected: string[] = []
    for (const id of ids) {
      const file = fileMap.get(id)
      if (
        file?.status === FileStatus.Attached &&
        file.problemId === problemId
      ) {
        continue
      }
      if (
        file?.status === FileStatus.Temporary &&
        file.createdById === userId
      ) {
        toAttach.push(id)
        continue
      }
      rejected.push(id)
    }

    if (rejected.length) {
      throw new UnprocessableDataException(
        `Invalid attachment ids: ${rejected.join(', ')}`
      )
    }
    if (!toAttach.length) return

    const { count } = await tx.file.updateMany({
      where: {
        filename: { in: toAttach },
        status: FileStatus.Temporary,
        createdById: userId
      },
      data: { status: FileStatus.Attached, problemId }
    })
    if (count !== toAttach.length) {
      throw new UnprocessableDataException(
        'Attachments were changed by another request'
      )
    }
  }

  diff(
    prevIds: string[],
    nextIds: string[]
  ): { added: string[]; removed: string[] } {
    return this.attachmentService.diff(prevIds, nextIds)
  }

  /**
   * Returns filenames of files attached to the problem among `ids`,
   * or all of its attached files when `ids` is omitted.
   */
  async findDeletable(
    tx: TransactionClient,
    problemId: number,
    ids?: string[]
  ): Promise<string[]> {
    if (ids && !ids.length) return []

    const files = await tx.file.findMany({
      where: {
        problemId,
        status: FileStatus.Attached,
        ...(ids && { filename: { in: ids } })
      },
      select: { filename: true }
    })
    return files.map(({ filename }) => filename)
  }

  /**
   * Drops filenames that the saved fields still reference in any form,
   * so they stay attached instead of being deleted.
   */
  excludeReferenced(
    fields: ProblemAttachmentFields,
    filenames: string[]
  ): string[] {
    const referenced = new Set(
      this.attachmentService.findReferencedFilenames(
        this.toHtmls(fields),
        filenames
      )
    )
    return filenames.filter((filename) => !referenced.has(filename))
  }

  async deleteRecords(
    tx: TransactionClient,
    problemId: number,
    filenames: string[]
  ): Promise<void> {
    if (!filenames.length) return

    await tx.file.deleteMany({
      where: {
        problemId,
        status: FileStatus.Attached,
        filename: { in: filenames }
      }
    })
  }

  toUrl(filename: string): string {
    return this.attachmentService.toUrl(filename)
  }

  async deleteFromStorage(filenames: string[]): Promise<void> {
    if (!filenames.length) return
    await this.attachmentService.deleteFromStorage(filenames)
  }

  async getAttachments(problemId: number) {
    const files = await this.prisma.file.findMany({
      where: { problemId, status: FileStatus.Attached },
      select: { filename: true },
      orderBy: { createTime: 'asc' }
    })
    return this.attachmentService.toAttachments(files)
  }

  private toHtmls(fields: ProblemAttachmentFields) {
    return PROBLEM_ATTACHMENT_FIELDS.map((field) => fields[field])
  }
}
