import { Args, Context, Int, Mutation, Resolver, Query } from '@nestjs/graphql'
import { AuthenticatedRequest } from '@libs/auth'
import { CursorValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { CheckRequest } from '@admin/@generated'
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
   * @param {CreatePlagiarismCheckInput} checkDto 표절 검사 요청에 필요한 설정을 포함합니다.
   * - 언어(필수, Language Enum)
   * - 최소 토큰 수(옵션, 기본: 12)
   * - enableMerging(옵션, 기본: false)
   * - useJplagClustering(옵션, 기본: true)
   * @param {number} problemId 검사를 수행할 문제 아이디
   * @param {number} assignmentId 검사를 수행할 과제 아이디
   * @returns {CheckRequest} 생성된 검사 요청 기록을 반환합니다.
   * - 요청 기록에 포함된 checkId로 검사 결과를 조회할 수 있습니다.
   */
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

  /**
   * 특정 Assignment와 Problem에 대해 요청된 모든 표절 검사 요청을 조회합니다.
   *
   * @param {number} problemId 문제 아이디
   * @param {number} assignmentId 과제 아이디
   * @returns {CheckRequest[]} 제공된 문제/과제에 맞는 표절 검사 요청 목록
   */
  @Query(() => [CheckRequest])
  async getCheckRequests(
    @Args('problemId', { type: () => Int }) problemId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number
  ) {
    return await this.checkService.getCheckRequests({
      problemId,
      assignmentId
    })
  }

  /**
   * 완료된 표절 검사 요청의 결과를 조회합니다.
   *
   * @param {number} checkId 표절 검사 요청의 아이디
   * @param {number} take 한 번에 조회할 검사 결과의 수
   * @param {number} cursor 페이지 커서
   * @returns {GetCheckResultSummaryOutput[]} 각 제출물 쌍의 비교 결과를 take 수 만큼 반환합니다.
   */
  @Query(() => [GetCheckResultSummaryOutput])
  async overviewCheckByRequestId(
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
    return await this.checkService.getCheckResultsById({
      checkId,
      take,
      cursor
    })
  }

  /**
   * 완료된 최신의 표절 검사 요청의 결과를 assignment 아이디 및 problem 아이디를 통해 조회합니다.
   *
   * @param {number} problemId 검사를 수행할 문제 아이디
   * @param {number} assignmentId 검사를 수행할 과제 아이디
   * @param {number} take 한 번에 조회할 검사 결과의 수
   * @param {number} cursor 페이지 커서
   * @returns {GetCheckResultSummaryOutput[]} 각 제출물 쌍의 비교 결과를 take 수 만큼 반환합니다.
   */
  @Query(() => [GetCheckResultSummaryOutput])
  async overviewCheckByAssignmentProblemId(
    @Args('problemId', { type: () => Int }) problemId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args(
      'take',
      { type: () => Int, defaultValue: 50 },
      new RequiredIntPipe('take')
    )
    take: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null
  ): Promise<GetCheckResultSummaryOutput[]> {
    return await this.checkService.getCheckResultsByAssignmentProblemId({
      problemId,
      assignmentId,
      take,
      cursor
    })
  }

  /**
   * 표절이 강하게 의심되는 제출물 그룹을 조회합니다.
   *
   * @param {number} clusterId 조회하려는 클러스터의 아이디
   * @returns {GetClusterOutput} 클러스터 정보
   */
  @Query(() => GetClusterOutput)
  async getCluster(
    @Args('clusterId', { type: () => Int }) clusterId: number
  ): Promise<GetClusterOutput> {
    return await this.checkService.getCluster({
      clusterId
    })
  }

  /**
   * 1개의 표절 검사 기록을 조회합니다
   * 코드에서 표절이 의심되는 라인, 컬럼 넘버를 함께 제공합니다.
   *
   * @param {number} resultId 제출물 쌍의 표절 검사 기록 아이디
   * @returns {GetCheckResultDetailOutput} 자세한 표절 검사 결과
   */
  @Query(() => GetCheckResultDetailOutput)
  async getCheckResultDetails(
    @Args('resultId', { type: () => Int }) resultId: number
  ): Promise<GetCheckResultDetailOutput> {
    return await this.checkService.getDetails({
      resultId
    })
  }
}
