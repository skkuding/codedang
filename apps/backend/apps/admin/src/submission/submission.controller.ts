import {
  Controller,
  Req,
  Res,
  Get,
  Param,
  UseGuards,
  Patch,
  Query
} from '@nestjs/common'
import { Response } from 'express'
import { AdminGuard, AuthenticatedRequest } from '@libs/auth'
import { IDValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { SubmissionService } from './submission.service'

@Controller('submission')
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

  @UseGuards(AdminGuard)
  @Patch('rejudgeByProblem')
  async rejudgeByProblem(
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('contestId', IDValidationPipe) contestId: number | null,
    @Query('assignmentId', IDValidationPipe) assignmentId: number | null,
    @Query('workbookId', IDValidationPipe) workbookId: number | null
  ): Promise<{
    successCount: number
    failedSubmissions: { submissionId: number; error: string }[]
  }> {
    return this.submissionService.rejudgeSubmissionsByProblem(
      problemId,
      contestId,
      assignmentId,
      workbookId
    )
  }

  @UseGuards(AdminGuard)
  @Patch('rejudgeBySubmission')
  async rejudgeBySubmission(
    @Query('submissionId', new RequiredIntPipe('submissionId'))
    submissionId: number
  ): Promise<{ success: boolean; error?: string }> {
    return this.submissionService.rejudgeSubmissionById(submissionId)
  }
}
