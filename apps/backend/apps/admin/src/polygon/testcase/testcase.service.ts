import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { Parse } from 'unzipper'
import { MAX_ZIP_SIZE } from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import type { PrismaService } from '@libs/prisma'
import type { FileService } from '@admin/problem/services'

export class PolygonTestCaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService
  ) {}

  //.zip파일 업로드
  //필요한 구현: 유저 권한, 유저 Id
  async uploadTestcaseZipfile(
    userId: number,
    problemId: number,
    file: FileUpload
  ) {
    const { filename, mimetype, createReadStream } = file

    if (!filename.endsWith('.zip')) {
      throw new UnprocessableDataException('Only zip files are accepted')
    }

    await this.fileService.getFileSize(createReadStream(), MAX_ZIP_SIZE)

    //.in/.out 에 대응하는 .out/.in 쌍을 검증하기 위해 Set에 기록
    const inFiles = new Set<string>()
    const outFiles = new Set<string>()

    const stream = createReadStream().pipe(Parse({ forceStream: true }))

    //const chunkName = chunk.path.split('.').slice(0, -1).join('.')
    //const extension = chunk.path.split('.').pop()

    //수동 업로드
  }
}
