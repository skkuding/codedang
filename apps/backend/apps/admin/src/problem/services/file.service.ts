import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileStatus } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { randomUUID } from 'crypto'
import type { Readable } from 'stream'
import { buildMediaUrl } from '@libs/attachment'
import { MAX_FILE_SIZE, MAX_IMAGE_SIZE } from '@libs/constants'
import {
  UnprocessableDataException,
  UnprocessableFileDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'
import type { UploadFileInput } from '../model/problem.input'
import { PROBLEM_ATTACHMENT_FIELDS } from './problem-attachment.service'

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly config: ConfigService
  ) {}

  /**
   * 기존 업로드 API(uploadImage/uploadFile)용.
   * 파일을 Unmanaged 상태로 저장하고 공개 URL을 반환한다.
   */
  async uploadFile(input: UploadFileInput, userId: number, isImage: boolean) {
    const filename = await this.storeFile(input, userId, isImage)
    return { src: this.getFileUrl(filename) }
  }

  /**
   * Problem 전용 업로드 API(uploadProblemImage/uploadProblemFile)용.
   * 파일을 Temporary 상태로 저장하고 첨부 ID(filename)를 반환한다.
   * 문제를 저장할 때 해당 문제에 귀속(Attached)된다.
   */
  async uploadProblemAttachment(
    input: UploadFileInput,
    userId: number,
    isImage: boolean
  ) {
    const attachmentId = await this.storeFile(
      input,
      userId,
      isImage,
      FileStatus.Temporary
    )
    return { attachmentId }
  }

  /**
   * MIME·크기를 검증한 뒤 S3에 업로드하고 File 레코드를 생성한다.
   * DB 저장에 실패하면 업로드한 S3 객체를 삭제한다.
   * @returns 생성된 파일의 filename(UUID)
   */
  private async storeFile(
    input: UploadFileInput,
    userId: number,
    isImage: boolean,
    status: FileStatus = FileStatus.Unmanaged
  ) {
    const { mimetype, createReadStream } = await input.file
    const newFilename = randomUUID()

    if (isImage && !mimetype.includes('image/')) {
      throw new UnprocessableDataException('Only image files can be accepted')
    }

    if (!isImage && mimetype !== 'application/pdf') {
      throw new UnprocessableDataException('Only pdf files can be accepted')
    }

    const fileSize = await this.getFileSize(
      createReadStream(),
      isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE
    )
    try {
      await this.storageService.uploadFile({
        filename: newFilename,
        fileSize,
        content: createReadStream(),
        type: mimetype
      })
      await this.prisma.file.create({
        data: {
          filename: newFilename,
          createdById: userId,
          status
        }
      })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        await this.storageService.deleteFile(newFilename) // 파일이 S3에 업로드되었지만, DB에 파일 정보 등록을 실패한 경우 rollback
      }
      throw new UnprocessableFileDataException(
        'Error occurred during file upload',
        newFilename
      )
    }

    return newFilename
  }

  async deleteFile(filename: string, userId: number) {
    const file = await this.prisma.file.findFirst({
      where: { filename, createdById: userId }
    })

    if (!file) {
      throw new UnprocessableDataException(
        'File not found or you do not have permission to delete this file'
      )
    }

    if (file.status === FileStatus.Attached) {
      throw new UnprocessableDataException(
        'Attached files are deleted by updating or deleting the problem'
      )
    }

    // HOTFIX: Unmanaged files may be shared by multiple bodies, so keep them.
    if (file.status === FileStatus.Unmanaged) {
      return file
    }

    // A saved body can reference a Temporary file that was never attached
    // (e.g. saved before attachment handling), so never delete it then.
    const referencingProblem = await this.prisma.problem.findFirst({
      where: {
        OR: PROBLEM_ATTACHMENT_FIELDS.map((field) => ({
          [field]: { contains: filename, mode: 'insensitive' as const }
        }))
      },
      select: { id: true }
    })
    if (referencingProblem) {
      throw new UnprocessableDataException(
        `File is still referenced by problem ${referencingProblem.id}`
      )
    }

    const { count } = await this.prisma.file.deleteMany({
      where: { filename, status: FileStatus.Temporary, createdById: userId }
    })
    if (!count) {
      throw new UnprocessableDataException('File is no longer deletable')
    }

    try {
      await this.storageService.deleteFile(filename)
    } catch (error) {
      // Restore the Temporary row so the same request can retry the deletion
      await this.prisma.file.create({
        data: {
          filename: file.filename,
          createdById: file.createdById,
          createTime: file.createTime,
          status: FileStatus.Temporary
        }
      })
      throw new UnprocessableDataException(
        `Failed to delete file from storage: ${error.message}`
      )
    }
    return file
  }

  async getFileSize(readStream: Readable, maxSize: number): Promise<number> {
    return new Promise((resolve, reject) => {
      let total = 0
      let settled = false

      const onError = (err) => {
        if (settled) return
        settled = true
        reject(
          err ??
            new UnprocessableDataException(
              'Error occurred during calculating file size.'
            )
        )
      }

      readStream.once('error', onError)
      readStream.on('data', (chunk: Buffer) => {
        total += chunk.length
        if (total > maxSize && !settled) {
          settled = true
          readStream.destroy(new Error('MAX_SIZE_EXCEEDED'))
          reject(
            new UnprocessableDataException('File size exceeds maximum limit')
          )
        }
      })
      readStream.once('end', () => {
        if (settled) return
        settled = true
        resolve(total)
      })
      readStream.once('close', () => {
        if (!settled) onError(new Error('ERR_STREAM_PREMATURE_CLOSE'))
      })
    })
  }

  /**
   * Returns the public URL of a media object.
   * URL resolution rules are defined in `buildMediaUrl` (@libs/attachment).
   */
  getFileUrl(filename: string) {
    return buildMediaUrl(this.config, filename)
  }
}
