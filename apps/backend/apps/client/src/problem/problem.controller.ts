import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Query,
  Req
} from '@nestjs/common'
import {
  AuthNotNeededIfOpenSpace,
  UserNullWhenAuthFailedIfOpenSpace,
  AuthenticatedRequest
} from '@libs/auth'
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  RequiredIntPipe,
  ProblemOrderPipe
} from '@libs/pipe'
import { ProblemOrder } from './enum/problem-order.enum'
import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'

@Controller('problem')
export class ProblemController {
  constructor(
    private readonly problemService: ProblemService,
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Get()
  @UserNullWhenAuthFailedIfOpenSpace()
  async getProblems(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe)
    groupId: number,
    @Query('workbookId', IDValidationPipe) workbookId: number | null,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('order', ProblemOrderPipe)
    order: ProblemOrder,
    @Query('search') search?: string
  ) {
    if (!workbookId) {
      return await this.problemService.getProblems({
        userId: req.user?.id ?? null,
        cursor,
        take,
        groupId,
        order,
        search
      })
    }
    return await this.workbookProblemService.getWorkbookProblems({
      workbookId,
      cursor,
      take,
      groupId
    })
  }

  @Get(':problemId')
  @AuthNotNeededIfOpenSpace()
  async getProblem(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('workbookId', IDValidationPipe) workbookId: number | null,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    if (!workbookId) {
      return await this.problemService.getProblem(problemId, groupId)
    }
    return await this.workbookProblemService.getWorkbookProblem(
      workbookId!,
      problemId,
      groupId
    )
  }
}

@Controller('contest/:contestId/problem')
export class ContestProblemController {
  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get()
  async getContestProblems(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', IDValidationPipe) contestId: number,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number
  ) {
    return await this.contestProblemService.getContestProblems({
      contestId,
      userId: req.user.id,
      cursor,
      take,
      groupId
    })
  }

  @Get(':problemId')
  async getContestProblem(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', IDValidationPipe) contestId: number,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.contestProblemService.getContestProblem({
      contestId,
      problemId,
      userId: req.user.id,
      groupId
    })
  }
}
