import { Controller, Post, Query, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '@libs/auth'
import { RequiredIntPipe } from '@libs/pipe'
import type { CheckService } from './check.service'

@Controller('check')
export class CheckController {
  constructor(private readonly checkService: CheckService) {}

  /**
   * 아직 완료되지 않은 표절 검사 기록을 만들고,
   * 한 문제의 모든 제출 기록에 대해 표절 검사 요청을 보냅니다.
   *
   * contest, assignment, workbook ID를 받아야 할까요? => 필요 없을 걸로 보입니다.
   *
   * @param req
   * @param problemId
   * @returns
   */
  @Post()
  async checkProblemSubmissions(
    @Req() req: AuthenticatedRequest,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return await this.checkService.plagiarismCheckSubmissions({
      userId: req.user.id,
      problemId
    })
  }
}
