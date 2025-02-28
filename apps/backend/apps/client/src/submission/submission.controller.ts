import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Query,
  DefaultValuePipe,
  Headers,
  ParseIntPipe,
  Sse
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { AuthNotNeededIfOpenSpace, AuthenticatedRequest } from '@libs/auth'
import { UnprocessableDataException } from '@libs/exception'
import {
  CursorValidationPipe,
  GroupIDPipe,
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
    @Query('groupId', GroupIDPipe) groupId: number,
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
        problemId,
        groupId
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
        assignmentId,
        groupId
      })
    } else if (workbookId) {
      return await this.submissionService.submitToWorkbook({
        submissionDto,
        userIp,
        userId: req.user.id,
        problemId,
        workbookId,
        groupId
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
  @Get('test/:testSubmissionId')
  async getTestResult(
    @Req() req: AuthenticatedRequest,
    @Param('testSubmissionId', IDValidationPipe) testSubmissionId: number
  ) {
    return await this.submissionService.getTestResult(
      req.user.id,
      testSubmissionId,
      false
    )
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
  @Get('user-test/:testSubmissionId')
  async getUserTestResult(
    @Req() req: AuthenticatedRequest,
    @Param('testSubmissionId', IDValidationPipe) testSubmissionId: number
  ) {
    return await this.submissionService.getTestResult(
      req.user.id,
      testSubmissionId,
      true
    )
  }

  @Get('delay-cause')
  async checkDelay() {
    return await this.submissionService.checkDelay()
  }

  @Get()
  @AuthNotNeededIfOpenSpace()
  async getSubmissions(
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.submissionService.getSubmissions({
      cursor,
      take,
      problemId,
      groupId
    })
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number,
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
      groupId,
      contestId,
      assignmentId
    })
  }

  /**
   * Server-Sent-Event(SSE)를 통해 테스트케이스 채점 결과를 실시간으로 송신합니다.
   * 클라이언트는 해당 SSE 연결을 통해 채점 결과를 실시간으로 수신할 수 있습니다.
   *
   * @param {number} submissionId - 제출한 Submission의 ID
   * @returns {Observable<MessageEvent>} SSE 연결을 위한 Observable 객체를 반환하며, 테스트케이스 채점 결과가 포함된 MessageEvent를 전송함
   */
  @Sse('submission-result/:submissionId')
  async getTestcaseResultOfSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('submissionId', ParseIntPipe) submissionId: number
  ): Promise<Observable<MessageEvent>> {
    return await this.submissionService.getTestcaseResultOfSubmission(
      req.user.id,
      submissionId
    )
  }

  /**
   * Server-Sent-Event(SSE)를 통해 테스트케이스 채점 결과를 실시간으로 송신합니다.
   * Test API 호출을 통해 실행된 Testcase의 채점 결과를 실시간으로 송신합니다.
   * 클라이언트는 해당 SSE 연결을 통해 채점 결과를 실시간으로 수신할 수 있습니다.
   *
   * @param {number} testSubmissionId - 제출한 Test Submission의 ID
   * @returns {Observable<MessageEvent>} SSE 연결을 위한 Observable 객체를 반환하며, 테스트케이스 채점 결과가 포함된 MessageEvent를 전송함
   */
  @Sse(`test-result/:testSubmissionId`)
  async getTestcaseResultOfTest(
    @Req() req: AuthenticatedRequest,
    @Param('testSubmissionId', ParseIntPipe) testSubmissionId: number
  ): Promise<Observable<MessageEvent>> {
    return await this.submissionService.getTestcaseResultOfTest(
      req.user.id,
      testSubmissionId
    )
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
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.submissionService.getContestSubmissions({
      cursor,
      take,
      problemId,
      contestId,
      userId: req.user.id,
      groupId
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
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.submissionService.getAssignmentSubmissions({
      cursor,
      take,
      problemId,
      assignmentId,
      userId: req.user.id,
      groupId
    })
  }
}
