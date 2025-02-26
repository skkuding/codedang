import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Query,
  Req
} from '@nestjs/common'
import { AuthNotNeededIfOpenSpace, AuthenticatedRequest } from '@libs/auth'
import { UnprocessableDataException } from '@libs/exception'
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  RequiredIntPipe,
  ProblemOrderPipe,
  NullableGroupIDPipe
} from '@libs/pipe'
import { ProblemOrder } from './enum/problem-order.enum'
import {
  ContestProblemService,
  AssignmentProblemService,
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
  @AuthNotNeededIfOpenSpace()
  async getProblems(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', NullableGroupIDPipe) groupId: number | null,
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
        order,
        search
      })
    }
    if (!groupId) {
      throw new UnprocessableDataException(
        'groupId is required in the request when getting workbook problems'
      )
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
    @Query('groupId', NullableGroupIDPipe) groupId: number | null,
    @Query('workbookId', IDValidationPipe) workbookId: number | null,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    if (!workbookId) {
      return await this.problemService.getProblem(problemId)
    }
    if (!groupId) {
      throw new UnprocessableDataException(
        'groupId is required in the request when getting a workbook problem'
      )
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
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number
  ) {
    return await this.contestProblemService.getContestProblems({
      contestId,
      userId: req.user.id,
      cursor,
      take
    })
  }

  @Get(':problemId')
  async getContestProblem(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', IDValidationPipe) contestId: number,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return await this.contestProblemService.getContestProblem({
      contestId,
      problemId,
      userId: req.user.id
    })
  }
}

@Controller('assignment/:assignmentId/problem')
export class AssignmentProblemController {
  constructor(
    private readonly assignmentProblemService: AssignmentProblemService
  ) {}

  @Get()
  async getAssignmentProblems(
    @Req() req: AuthenticatedRequest,
    @Param('assignmentId', IDValidationPipe) assignmentId: number,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number
  ) {
    return await this.assignmentProblemService.getAssignmentProblems({
      assignmentId,
      userId: req.user.id,
      cursor,
      take
    })
  }

  @Get(':problemId')
  async getAssignmentProblem(
    @Req() req: AuthenticatedRequest,
    @Param('assignmentId', IDValidationPipe) assignmentId: number,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return await this.assignmentProblemService.getAssignmentProblem({
      assignmentId,
      problemId,
      userId: req.user.id
    })
  }
}
