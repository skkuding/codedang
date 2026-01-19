import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Query,
  Req,
  Res,
  StreamableFile
} from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'
import {
  AuthNotNeededIfPublic,
  AuthenticatedRequest,
  UserNullWhenAuthFailedIfPublic
} from '@libs/auth'
import { UnprocessableDataException } from '@libs/exception'
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  NullableGroupIDPipe,
  ProblemOrder,
  ProblemOrderPipe,
  RequiredIntPipe
} from '@libs/pipe'
import {
  AssignmentProblemService,
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

  @ApiQuery({
    name: 'order',
    enum: ProblemOrder,
    enumName: 'ProblemOrder'
  })
  @Get()
  @AuthNotNeededIfPublic()
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
  @AuthNotNeededIfPublic()
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

  @Get(':problemId/update-history')
  async getProblemUpdateHistory(@Param('problemId') problemId: number) {
    return await this.problemService.getProblemUpdateHistory(problemId)
  }

  @Get(':problemId/download')
  @AuthNotNeededIfPublic()
  async downloadProblem(
    @Req() req: AuthenticatedRequest,
    @Param('problemId') problemId: number,
    @Query('mode') mode: 'my' | 'shared',
    @Res({ passthrough: true }) res: Response
  ) {
    const { stream, contentType, filename } =
      await this.problemService.downloadProblem({
        userId: req.user.id,
        mode
      })

    res.headers.set('Content-Type', contentType)
    res.headers.set('Content-Disposition', `attachment; filename="${filename}"`)

    return new StreamableFile(stream)
  }
}

@Controller('contest/:contestId/problem')
export class ContestProblemController {
  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get()
  @UserNullWhenAuthFailedIfPublic()
  async getContestProblems(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', IDValidationPipe) contestId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number
  ) {
    return await this.contestProblemService.getContestProblems({
      contestId,
      userId: req.user?.id,
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

  @Get(':problemId/statistics/graph')
  @UserNullWhenAuthFailedIfPublic()
  async getContestProblemStatistics(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', IDValidationPipe) contestId: number,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return await this.contestProblemService.getContestProblemStatistics({
      contestId,
      problemId
    })
  }

  @Get(':problemId/update-history')
  async getProblemUpdateHistory(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', IDValidationPipe) contestId: number,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return await this.contestProblemService.getContestProblemUpdateHistory({
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
