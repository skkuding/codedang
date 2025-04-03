import { Controller, Req, Res, Get, Param } from '@nestjs/common'
import { Response } from 'express'
import { AuthenticatedRequest } from '@libs/auth'
import { SubmissionService } from './submission.service'

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get('/download/:filename')
  async downloadCodes(
    @Param('filename') filename: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    await this.submissionService.downloadCodes(filename, res)
  }
}
