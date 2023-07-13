import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,
  Req,
  ParseIntPipe
} from '@nestjs/common'
import type { Submission, SubmissionResult } from '@prisma/client'
import { AuthenticatedRequest, GroupMemberGuard } from '@libs/auth'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { SubmissionService } from './submission.service'

@Controller('problem/:problemId/submission')
export class ProblemSubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Body() submissionDto: CreateSubmissionDto
  ): Promise<Submission> {
    return await this.submissionService.submitToProblem(
      submissionDto,
      req.user.id
    )
  }

  @Get()
  async getSubmissions(
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<Partial<Submission>[]> {
    return await this.submissionService.getSubmissions(problemId)
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ): Promise<SubmissionResult[]> {
    return await this.submissionService.getSubmission(
      id,
      problemId,
      req.user.id
    )
  }
}

@Controller('group/:groupId/problem/:problemId/submission')
@UseGuards(GroupMemberGuard)
export class GroupProblemSubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() submissionDto: CreateSubmissionDto
  ): Promise<Submission> {
    return await this.submissionService.submitToProblem(
      submissionDto,
      req.user.id,
      groupId
    )
  }

  @Get()
  async getSubmissions(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<Partial<Submission>[]> {
    return await this.submissionService.getSubmissions(problemId, groupId)
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ): Promise<SubmissionResult[]> {
    return await this.submissionService.getSubmission(
      id,
      problemId,
      req.user.id,
      groupId
    )
  }
}

@Controller('contest/:contestId/problem/:problemId/submission')
export class ContestSubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Body() submissionDto: CreateSubmissionDto
  ): Promise<Submission> {
    submissionDto.contestId = contestId
    return await this.submissionService.submitToContest(
      submissionDto,
      req.user.id
    )
  }

  @Get()
  async getSubmissions(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<Partial<Submission>[]> {
    return await this.submissionService.getContestSubmissions(
      problemId,
      contestId,
      req.user.id
    )
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ): Promise<SubmissionResult[]> {
    return await this.submissionService.getContestSubmission(
      id,
      problemId,
      contestId,
      req.user.id
    )
  }
}

@Controller('group/:groupId/contest/:contestId/problem/:problemId/submission')
@UseGuards(GroupMemberGuard)
export class GroupContestSubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Body() submissionDto: CreateSubmissionDto
  ): Promise<Submission> {
    submissionDto.contestId = contestId
    return await this.submissionService.submitToContest(
      submissionDto,
      req.user.id,
      groupId
    )
  }

  @Get()
  async getSubmissions(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<Partial<Submission>[]> {
    return await this.submissionService.getContestSubmissions(
      problemId,
      contestId,
      req.user.id,
      groupId
    )
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ): Promise<SubmissionResult[]> {
    return await this.submissionService.getContestSubmission(
      id,
      problemId,
      contestId,
      req.user.id,
      groupId
    )
  }
}

@Controller('workbook/:workbookId/problem/:problemId/submission')
export class WorkbookSubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Body() submissionDto: CreateSubmissionDto
  ): Promise<Submission> {
    submissionDto.workbookId = workbookId
    return await this.submissionService.submitToWorkbook(
      submissionDto,
      req.user.id
    )
  }

  @Get()
  async getSubmissions(
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<Partial<Submission>[]> {
    return await this.submissionService.getSubmissions(problemId)
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ): Promise<SubmissionResult[]> {
    return await this.submissionService.getSubmission(
      id,
      problemId,
      req.user.id
    )
  }
}

@Controller('group/:groupId/workbook/:workbookId/problem/:problemId/submission')
@UseGuards(GroupMemberGuard)
export class GroupWorkbookSubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Body() submissionDto: CreateSubmissionDto
  ): Promise<Submission> {
    submissionDto.workbookId = workbookId
    return await this.submissionService.submitToWorkbook(
      submissionDto,
      req.user.id,
      groupId
    )
  }

  @Get()
  async getSubmissions(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<Partial<Submission>[]> {
    return await this.submissionService.getSubmissions(problemId, groupId)
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ): Promise<SubmissionResult[]> {
    return await this.submissionService.getSubmission(
      id,
      problemId,
      req.user.id,
      groupId
    )
  }
}
