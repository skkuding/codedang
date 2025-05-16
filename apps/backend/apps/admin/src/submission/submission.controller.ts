import { Controller, Req, Res, Get, Param } from '@nestjs/common'
import { Response } from 'express'
import { AuthenticatedRequest, UseGroupLeaderGuard } from '@libs/auth'
import { GroupIDPipe, IDValidationPipe } from '@libs/pipe'
import { SubmissionService } from './submission.service'

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  /**
   * compressSourceCodes 메서드를 통해 압축된 zipFile을 스트리밍을 통해 다운로드 합니다.
   * filename은 압축된 zipFile의 이름으로 ${assignmentTitle}_${problemId}의 형식으로 저장됩니다.
   */
  @Get('/download/:groupId/:assignmentId/:filename')
  @UseGroupLeaderGuard()
  async downloadCodes(
    @Param('groupId', GroupIDPipe) groupId: number,
    @Param('assignmentId', IDValidationPipe) assignmentId: number,
    @Param('filename') filename: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    await this.submissionService.downloadCodes(
      groupId,
      assignmentId,
      filename,
      res
    )
  }
}
