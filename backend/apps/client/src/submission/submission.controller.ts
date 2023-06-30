import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,
  Req
} from '@nestjs/common'
import type { Submission } from '@prisma/client'
import { AuthenticatedRequest } from '@libs/auth'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import type { SubmissionResultDTO } from './dto/submission-result.dto'
import { ContestProblemSubmissionGuard } from './guard/contestProblemSubmission.guard'
import { PublicProblemSubmissionGuard } from './guard/publicProblemSubmission.guard'
import { SubmissionResultGuard } from './guard/submissionResult.guard'
import { WorkbookProblemSubmissionGuard } from './guard/workbookProblemSubmission.guard'
import { SubmissionService } from './submission.service'

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get('result/:submissionId')
  @UseGuards(SubmissionResultGuard)
  async getSubmissionResults(
    @Param('submissionId') submissionId: string
  ): Promise<SubmissionResultDTO> {
    return await this.submissionService.getSubmissionResults(submissionId)
  }

  @Post('problem/:problemId')
  @UseGuards(PublicProblemSubmissionGuard)
  async createPublicSubmission(
    @Body() createSubmissionDTO: CreateSubmissionDto,
    @Req() req: AuthenticatedRequest
  ): Promise<Submission & { submissionResultIds: { id: number }[] }> {
    return await this.submissionService.createSubmission(
      createSubmissionDTO,
      req.user.id
    )
  }

  @Post('contest/:contestId/problem/:problemId')
  @UseGuards(ContestProblemSubmissionGuard)
  async createContestSubmission(
    @Body() createSubmissionDTO: CreateSubmissionDto,
    @Param('contestId') contestId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<Submission & { submissionResultIds: { id: number }[] }> {
    createSubmissionDTO.contestId = contestId
    return await this.submissionService.createSubmission(
      createSubmissionDTO,
      req.user.id
    )
  }

  @Post('workbook/:workbookId/problem/:problemId')
  @UseGuards(WorkbookProblemSubmissionGuard)
  async createWorkbookSubmission(
    @Body() createSubmissionDTO: CreateSubmissionDto,
    @Param('workbookId') workbookId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<Submission & { submissionResultIds: { id: number }[] }> {
    createSubmissionDTO.workbookId = workbookId
    return await this.submissionService.createSubmission(
      createSubmissionDTO,
      req.user.id
    )
  }
}
