import { Args, Context, Int, Mutation, Resolver, Query } from '@nestjs/graphql'
import { AuthenticatedRequest } from '@libs/auth'
import { CursorValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { CheckRequest, CheckResult } from '@admin/@generated'
import { CheckService } from './check.service'
import {
  GetCheckResultDetailOutput,
  GetCheckResultSummaryOutput,
  GetClusterOutput
} from './model/check-result.output'
import { CreatePlagiarismCheckInput } from './model/create-check.input'

@Resolver(() => CheckRequest)
export class CheckResolver {
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
   * - 요청 기록에 포함된 checkId로 검사 결과를 조회할 수 있습니다.
   */
  // 문제에 대해 표절 검사를 요청할 수 있는 유저인지 검증이 필요합니다.
  // GQL에서 POST, GET 구분은 어떻게 하나요?
  @Mutation(() => CheckRequest)
  async checkAssignmentSubmissions(
    @Context('req') req: AuthenticatedRequest,
    @Args('input', {
      nullable: false,
      type: () => CreatePlagiarismCheckInput
    })
    checkInput: CreatePlagiarismCheckInput,
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args('problemId', { type: () => Int }) problemId: number
  ): Promise<CheckRequest> {
    return await this.checkService.checkAssignmentProblem({
      userId: req.user.id,
      checkInput,
      assignmentId,
      problemId
    })
  }

  @Query(() => [GetCheckResultSummaryOutput])
  async overviewPlagiarismChecks(
    @Args('checkId', { type: () => Int }) checkId: number,
    @Args(
      'take',
      { type: () => Int, defaultValue: 50 },
      new RequiredIntPipe('take')
    )
    take: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null
  ): Promise<GetCheckResultSummaryOutput[]> {
    return await this.checkService.getCheckResults({
      checkId,
      take,
      cursor
    })
  }

  @Query(() => GetClusterOutput)
  async getCluster(
    @Args('clusterId', { type: () => Int }) clusterId: number
  ): Promise<GetClusterOutput> {
    return await this.checkService.getCluster({
      clusterId
    })
  }

  @Query(() => GetCheckResultDetailOutput)
  async getCheckResultDetails(
    @Args('resultId', { type: () => Int }) resultId: number
  ): Promise<GetCheckResultDetailOutput> {
    return await this.checkService.getDetails({
      resultId
    })
  }
}
