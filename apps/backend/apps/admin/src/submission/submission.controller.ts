import { Controller, Req, Res, Get, Param } from '@nestjs/common'
import { Response } from 'express'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import { IDValidationPipe } from '@libs/pipe'
import { SubmissionService } from './submission.service'

@Controller('submission')
export class SubmissionController {
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
    await this.submissionService.downloadSourceCodes(
      assignmentId,
      problemId,
      req.user.id,
      res
    )
  }
}
