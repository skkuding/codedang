import { Controller, Get, Param, Req, Res } from '@nestjs/common'
import { Response } from 'express'
import { AuthenticatedRequest } from '@libs/auth'
import { SubmissionService } from './submission.service'

@Controller('admin/submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  /**
   * compressSourceCodes 메서드를 통해 압축된 zipFile을 스트리밍을 통해 다운로드 합니다.
   * filename은 압축된 zipFile의 이름으로 ${assignmentTitle}_${problemId}의 형식으로 저장됩니다.
   */
  @Get('/download/:filename')
  async downloadCodes(
    @Param('filename') filename: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    await this.submissionService.downloadCodes(filename, res)
  }
}
