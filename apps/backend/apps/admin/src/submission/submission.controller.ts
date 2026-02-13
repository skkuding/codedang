import {
  Controller,
  Req,
  Res,
  Get,
  Param,
  StreamableFile
} from '@nestjs/common'
import { Logger } from '@nestjs/common'
import { Response } from 'express'
import { createReadStream, existsSync } from 'fs'
import { rm, unlink } from 'fs/promises'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import { IDValidationPipe } from '@libs/pipe'
import { SubmissionService } from './submission.service'

@Controller('submission')
export class SubmissionController {
  private readonly logger = new Logger(SubmissionController.name)
  constructor(private readonly submissionService: SubmissionService) {}

  /**
   * 특정 Assignment의 특정 Problem에 대한 제출 내역을 Zip file로 압축한 후 다운로드합니다.
   *
   * @param groupId 권한 검증을 위한 groupID
   * @param assignmentId AssignmentProblemRecode을 조회할 Assignment의 ID
   * @param problemId AssignmentProblemRecode을 조회할 problemID
   * @returns
   */
  @Get('/download/:assignmentId/:problemId')
  @UseDisableAdminGuard()
  async downloadCodes(
    @Param('assignmentId', IDValidationPipe) assignmentId: number,
    @Param('problemId', IDValidationPipe) problemId: number,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const { zipPath, zipFilename, dirPath } =
      await this.submissionService.downloadSourceCodes(
        assignmentId,
        problemId,
        req.user.id,
        res
      )

    const fileStream = createReadStream(zipPath)
    fileStream.on('close', async () => {
      try {
        if (existsSync(zipPath)) await unlink(zipPath)
        if (existsSync(dirPath))
          await rm(dirPath, { recursive: true, force: true })
      } catch (err) {
        this.logger.error(
          `Failed to remove temp files (Path: ${zipPath}: ${err.message}`
        )
      }
    })

    const encodedFilename = encodeURIComponent(zipFilename)
    res.set({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/zip',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Disposition': `attachment; filename='${encodedFilename}.zip'; filename*=UTF-8''${encodedFilename}.zip`
    })

    return new StreamableFile(fileStream)
  }
}
