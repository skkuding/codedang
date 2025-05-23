import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Query,
  DefaultValuePipe,
  Headers
} from '@nestjs/common'
import { AuthNotNeededIfPublic, AuthenticatedRequest } from '@libs/auth'
import { UnprocessableDataException } from '@libs/exception'
import {
  CursorValidationPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import {
  CreateSubmissionDto,
  CreateUserTestSubmissionDto
} from './class/create-submission.dto'
import { SubmissionService } from './submission.service'

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  /**
   * 아직 채점되지 않은 제출 기록을 만들고, 채점 서버에 채점 요청을 보냅니다.
   * 네 가지 제출 유형(일반 문제, 대회 문제, 과제 문제, Workbook 문제)에 대해 제출할 수 있습니다.
   * createSubmission은 제출 유형에 따라 다른 서비스 메소드를 호출합니다.
   * @returns 아직 채점되지 않은 제출 기록
   */
  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Headers('x-forwarded-for') userIp: string,
    @Body() submissionDto: CreateSubmissionDto,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('contestId', IDValidationPipe) contestId: number | null,
    @Query('assignmentId', IDValidationPipe) assignmentId: number | null,
    @Query('workbookId', IDValidationPipe) workbookId: number | null
  ) {
    const idCount =
      (contestId ? 1 : 0) + (assignmentId ? 1 : 0) + (workbookId ? 1 : 0)

    if (idCount > 1) {
      throw new UnprocessableDataException(
        'Only one of contestId, assignmentId, workbookId can be provided.'
      )
    }

    if (!contestId && !workbookId && !assignmentId) {
      return await this.submissionService.submitToProblem({
        submissionDto,
        userIp,
        userId: req.user.id,
        problemId
      })
    } else if (contestId) {
      return await this.submissionService.submitToContest({
        submissionDto,
        userIp,
        userId: req.user.id,
        problemId,
        contestId
      })
    } else if (assignmentId) {
      return await this.submissionService.submitToAssignment({
        submissionDto,
        userIp,
        userId: req.user.id,
        problemId,
        assignmentId
      })
    } else if (workbookId) {
      return await this.submissionService.submitToWorkbook({
        submissionDto,
        userIp,
        userId: req.user.id,
        problemId,
        workbookId
      })
    }
  }

  /**
   * Open Testcase에 대해 채점하는 Test를 요청합니다.
   * 채점 결과는 Cache에 저장됩니다.
   */
  @Post('test')
  async submitTest(
    @Req() req: AuthenticatedRequest,
    @Headers('x-forwarded-for') userIp: string,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Body() submissionDto: CreateSubmissionDto
  ) {
    return await this.submissionService.submitTest(
      req.user.id,
      problemId,
      userIp,
      submissionDto
    )
  }

  /**
   * requestTest의 반환으로 받은 key를 통해 Test 결과를 조회합니다.
   * @returns Testcase별 결과가 담겨있는 Object
   */
  @Get('test')
  async getTestResult(@Req() req: AuthenticatedRequest) {
    return await this.submissionService.getTestResult(req.user.id)
  }

  /**
   * 유저가 생성한 테스트케이스에 대해 실행을 요청합니다.
   * 채점 결과는 Cache에 저장됩니다.
   */
  @Post('user-test')
  async submitUserTest(
    @Req() req: AuthenticatedRequest,
    @Headers('x-forwarded-for') userIp: string,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Body() userTestSubmissionDto: CreateUserTestSubmissionDto
  ) {
    return await this.submissionService.submitTest(
      req.user.id,
      problemId,
      userIp,
      userTestSubmissionDto,
      true
    )
  }

  /**
   * 유저가 생성한 테스트케이스에 대한 실행 결과를 조회합니다.
   * @returns Testcase별 결과가 담겨있는 Object
   */
  @Get('user-test')
  async getUserTestResult(@Req() req: AuthenticatedRequest) {
    return await this.submissionService.getTestResult(req.user.id, true)
  }

  @Get('delay-cause')
  async checkDelay() {
    return await this.submissionService.checkDelay()
  }

  @Get()
  @AuthNotNeededIfPublic()
  async getSubmissions(
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return await this.submissionService.getSubmissions({
      cursor,
      take,
      problemId
    })
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('contestId', IDValidationPipe) contestId: number | null,
    @Query('assignmentId', IDValidationPipe) assignmentId: number | null,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    if (contestId && assignmentId) {
      throw new UnprocessableDataException(
        'Provide either contestId or assignmentId, not both.'
      )
    }
    return await this.submissionService.getSubmission({
      id,
      problemId,
      userId: req.user.id,
      userRole: req.user.role,
      contestId,
      assignmentId
    })
  }
}

@Controller('contest/:contestId/submission')
export class ContestSubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  async getSubmissions(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', IDValidationPipe) contestId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return await this.submissionService.getContestSubmissions({
      cursor,
      take,
      problemId,
      contestId,
      userId: req.user.id
    })
  }
}

@Controller('assignment/:assignmentId/submission')
export class AssignmentSubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  async getSubmissions(
    @Req() req: AuthenticatedRequest,
    @Param('assignmentId', IDValidationPipe) assignmentId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return await this.submissionService.getAssignmentSubmissions({
      cursor,
      take,
      problemId,
      assignmentId,
      userId: req.user.id
    })
  }

  @Get('/latest')
  async getLatestAssignmentProblemSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('assignmentId', IDValidationPipe) assignmentId: number,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return await this.submissionService.getLatestAssignmentProblemSubmission(
      problemId,
      assignmentId,
      req.user.id
    )
  }

  @Get('/summary')
  async getAssignmentSubmissionSummary(
    @Req() req: AuthenticatedRequest,
    @Param('assignmentId', IDValidationPipe) assignmentId: number
  ) {
    return await this.submissionService.getAssignmentSubmissionSummary(
      assignmentId,
      req.user.id
    )
  }
}
