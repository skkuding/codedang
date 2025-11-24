import { Controller, Get, Param, Req, Res } from '@nestjs/common'
import { Response } from 'express'
import { AuthenticatedRequest } from '@libs/auth'
import { RequiredIntPipe } from '@libs/pipe'
import { ProblemService } from '../services'

@Controller('admin/problem')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get('download/:problemId')
  async downloadProblem(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Res({ passthrough: true }) res: Response
  ) {
    return await this.problemService.downloadProblem({
      userId: req.user.id,
      problemId,
      res
    })
  }
}
