import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { randomUUID } from 'crypto'
import type { Readable } from 'stream'
import { MAX_FILE_SIZE, MAX_IMAGE_SIZE } from '@libs/constants'
import {
  UnprocessableDataException,
  UnprocessableFileDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'
import type { UploadFileInput } from '../model/problem.input'

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly config: ConfigService
  ) {}

  async uploadFile(input: UploadFileInput, userId: number, isImage: boolean) {
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
          createdById: userId
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

    // MINIO_ENDPOINT_URL is required only when accessing MINIO (stage, local)
    // In production, use the default S3 endpoint
    const endpoint = this.config.get<string>('MINIO_ENDPOINT_URL')
    const bucket = this.config.get<string>('MEDIA_BUCKET_NAME')
    const src = endpoint
      ? `${endpoint}/${bucket}/${newFilename}`
      : `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${newFilename}`

    return { src }
  }

  async deleteFile(filename: string, userId: number) {
    const deletedFile = await this.prisma.$transaction(async (tx) => {
      const fileExists = await tx.file.findFirst({
        where: {
          filename,
          createdById: userId
        }
      })

      if (!fileExists) {
        throw new UnprocessableDataException(
          'File not found or you do not have permission to delete this file'
        )
      }

      const file = await tx.file.delete({
        where: {
          filename,
          createdById: userId
        }
      })

      try {
        await this.storageService.deleteFile(filename)
      } catch (error) {
        throw new UnprocessableDataException(
          `Failed to delete file from storage: ${error.message}`
        )
      }

      return file
    })

    return deletedFile
  }

  async getFileSize(readStream: Readable, maxSize: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      readStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)

        const totalSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        if (totalSize > maxSize) {
          readStream.destroy()
          reject(
            new UnprocessableDataException('File size exceeds maximum limit')
          )
        }
      })

      readStream.on('end', () => {
        const fileSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        resolve(fileSize)
      })

      readStream.on('error', () => {
        reject(
          new UnprocessableDataException(
            'Error occurred during calculating file size.'
          )
        )
      })
    })
  }
}
