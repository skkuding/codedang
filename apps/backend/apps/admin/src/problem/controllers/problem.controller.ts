import { Controller, Get, Req, Query, Res } from '@nestjs/common'
import { AuthenticatedRequest } from '@libs/auth'
import { ProblemService } from '../services'

@Controller('problem')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get('download')
  async downloadProblems(
    @Req() req: AuthenticatedRequest,
    @Query('mode') mode: 'my' | 'shared',
    @Res({ passthrough: true }) res: Response
  ) {
    return await this.problemService.downloadProblem({
      userId: req.user.id,
      mode,
      res
    })
  }
}
