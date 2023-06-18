import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,
  Req
} from '@nestjs/common'
import { SubmissionService } from './submission.service'
import type { SubmissionResultDTO } from './dto/submission-result.dto'
import { SubmissionResultGuard } from './guard/submissionResult.guard'
import { ContestProblemSubmissionGuard } from './guard/contestProblemSubmission.guard'
import { WorkbookProblemSubmissionGuard } from './guard/workbookProblemSubmission.guard'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { AuthenticatedRequest } from '@client/auth/interface/authenticated-request.interface'
import type { Submission } from '@prisma/client'

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get('results/:submissionId')
  @UseGuards(SubmissionResultGuard)
  async getSubmissionResults(
    @Param('submissionId') submissionId: string
  ): Promise<SubmissionResultDTO> {
    return await this.submissionService.getSubmissionResults(submissionId)
  }

  @Post('problem/:problemId')
  async createPublicSubmission(
    @Body() createSubmissionDTO: CreateSubmissionDto,
    @Req() req: AuthenticatedRequest
  ): Promise<Submission> {
    return await this.submissionService.createSubmission(
      createSubmissionDTO,
      req.user.id
    )
  }

  @Post('contest/:contestId/problem/:problemId')
  @UseGuards(ContestProblemSubmissionGuard)
  async createContestSubmission(
    @Body() createSubmissionDTO: CreateSubmissionDto,
    @Req() req: AuthenticatedRequest
  ): Promise<Submission> {
    return await this.submissionService.createSubmission(
      createSubmissionDTO,
      req.user.id
    )
  }

  @Post('workbook/:workbookId/problem/:problemId')
  @UseGuards(WorkbookProblemSubmissionGuard)
  async createWorkbookSubmission(
    @Body() createSubmissionDTO: CreateSubmissionDto,
    @Req() req: AuthenticatedRequest
  ): Promise<Submission> {
    return await this.submissionService.createSubmission(
      createSubmissionDTO,
      req.user.id
    )
  }
}
