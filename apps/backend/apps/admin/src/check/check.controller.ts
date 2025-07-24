import { Body, Controller, Post, Query, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '@libs/auth'
import { RequiredIntPipe } from '@libs/pipe'
import type { CheckService } from './check.service'
import type { CreatePlagiarismCheckDto } from './class/create-check.dto'

@Controller('check')
export class CheckController {
  constructor(private readonly checkService: CheckService) {}

  /**
   * 아직 완료되지 않은 표절 검사 기록을 만들고,
   * 한 문제의 모든 제출 기록에 대해 표절 검사 요청을 보냅니다.
   *
   * @param {Request} req
   * @param {CreatePlagiarismCheckDto} checkDto 표절 검사 요청에 필요한 설정을 포함합니다.
   * - 언어(필수, Language Enum)
   * - 최소 토큰 수(옵션, 기본: 12)
   * - enableMerging(옵션, 기본: false)
   * - useJplagClustering(옵션, 기본: true)
   * @param {number} problemId 검사를 수행할 문제 아이디
   * @returns {Promise} 생성된 검사 요청 기록을 반환합니다.
   */
  // 문제에 대해 표절 검사를 요청할 수 있는 유저인지 검증이 필요합니다.
  @Post()
  async checkProblemSubmissions(
    @Req() req: AuthenticatedRequest,
    @Body() checkDto: CreatePlagiarismCheckDto,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return await this.checkService.plagiarismCheckSubmissions({
      userId: req.user.id,
      checkDto,
      problemId
    })
  }
}
