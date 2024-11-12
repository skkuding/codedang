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
import { AuthNotNeededIfOpenSpace, AuthenticatedRequest } from '@libs/auth'
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import {
  CreateSubmissionDto,
  type CreateUserTestSubmissionDto
} from './class/create-submission.dto'
import { SubmissionService } from './submission.service'

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Headers('x-forwarded-for') userIp: string,
    @Body() submissionDto: CreateSubmissionDto,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('contestId', IDValidationPipe) contestId: number | null,
    @Query('workbookId', IDValidationPipe) workbookId: number | null
  ) {
    if (!contestId && !workbookId) {
      return await this.submissionService.submitToProblem(
        submissionDto,
        userIp,
        req.user.id,
        problemId,
        groupId
      )
    } else if (contestId) {
      return await this.submissionService.submitToContest(
        submissionDto,
        userIp,
        req.user.id,
        problemId,
        contestId,
        groupId
      )
    } else if (workbookId) {
      return await this.submissionService.submitToWorkbook(
        submissionDto,
        userIp,
        req.user.id,
        problemId,
        workbookId,
        groupId
      )
    }
  }

  /**
   * Open Testcase에 대해 채점하는 Test를 요청합니다.
   * 채점 결과는 Cache에 저장됩니다.
   */
  @Post('test')
  async submitTest(
    @Req() req: AuthenticatedRequest,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Body() submissionDto: CreateSubmissionDto
  ) {
    return await this.submissionService.submitTest(
      req.user.id,
      problemId,
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
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Body() userTestSubmissionDto: CreateUserTestSubmissionDto
  ) {
    return await this.submissionService.submitTest(
      req.user.id,
      problemId,
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
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.submissionService.getSubmission(
      id,
      problemId,
      req.user.id,
      req.user.role,
      groupId,
      contestId
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
