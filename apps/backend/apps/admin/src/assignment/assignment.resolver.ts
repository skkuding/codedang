import { ParseBoolPipe } from '@nestjs/common'
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Assignment, AssignmentProblem } from '@generated'
import { AuthenticatedRequest, UseRolesGuard } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { AssignmentService } from './assignment.service'
import { AssignmentSubmissionSummaryForUser } from './model/assignment-submission-summary-for-user.model'
import { AssignmentWithParticipants } from './model/assignment-with-participants.model'
import { CreateAssignmentInput } from './model/assignment.input'
import { UpdateAssignmentInput } from './model/assignment.input'
import { AssignmentsGroupedByStatus } from './model/assignments-grouped-by-status.output'
import { DuplicatedAssignmentResponse } from './model/duplicated-assignment-response.output'
import { AssignmentProblemScoreInput } from './model/problem-score.input'
import { AssignmentPublicizingRequest } from './model/publicizing-request.model'
import { AssignmentPublicizingResponse } from './model/publicizing-response.output'
import { UserAssignmentScoreSummaryWithUserInfo } from './model/score-summary'

@Resolver(() => Assignment)
export class AssignmentResolver {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Query(() => [AssignmentWithParticipants])
  async getAssignments(
    @Args(
      'take',
      { type: () => Int, defaultValue: 10 },
      new RequiredIntPipe('take')
    )
    take: number,
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null
  ) {
    return await this.assignmentService.getAssignments(take, groupId, cursor)
  }

  @Query(() => AssignmentWithParticipants)
  async getAssignment(
    @Args(
      'assignmentId',
      { type: () => Int },
      new RequiredIntPipe('assignmentId')
    )
    assignmentId: number
  ) {
    return await this.assignmentService.getAssignment(assignmentId)
  }

  @Mutation(() => Assignment)
  async createAssignment(
    @Args('input') input: CreateAssignmentInput,
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.assignmentService.createAssignment(
      groupId,
      req.user.id,
      input
    )
  }

  @Mutation(() => Assignment)
  async updateAssignment(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('input') input: UpdateAssignmentInput
  ) {
    return await this.assignmentService.updateAssignment(groupId, input)
  }

  @Mutation(() => Assignment)
  async deleteAssignment(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number
  ) {
    return await this.assignmentService.deleteAssignment(groupId, assignmentId)
  }

  /**
   * Assignment의 소속 Group을 Open Space(groupId === 1)로 이동시키기 위한 요청(Publicizing Requests)들을 불러옵니다.
   * @returns Publicizing Request 배열
   */
  @Query(() => [AssignmentPublicizingRequest])
  @UseRolesGuard()
  async getAssignmentPublicizingRequests() {
    return await this.assignmentService.getPublicizingRequests()
  }

  /**
   * Assignment 소속 Group을 Open Space(groupId === 1)로 이동시키기 위한 요청(Publicizing Request)를 생성합니다.
   * @param groupId Assignment가 속한 Group의 ID. 이미 Open Space(groupId === 1)이 아니어야 합니다.
   * @param assignemtnId Assignment ID
   * @returns 생성된 Publicizing Request
   */
  @Mutation(() => AssignmentPublicizingRequest)
  async createAssignmentPublicizingRequest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number
  ) {
    return await this.assignmentService.createPublicizingRequest(
      groupId,
      assignmentId
    )
  }

  /**
   * Assignment 소속 Group을 Open Space(groupId === 1)로 이동시키기 위한 요청(Publicizing Request)을 처리합니다.
   * @param assignmentId Publicizing Request를 생성한 assignment의 Id
   * @param isAccepted 요청 수락 여부
   * @returns
   */
  @Mutation(() => AssignmentPublicizingResponse)
  @UseRolesGuard()
  async handleAssignmentPublicizingRequest(
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args('isAccepted', ParseBoolPipe) isAccepted: boolean
  ) {
    return await this.assignmentService.handlePublicizingRequest(
      assignmentId,
      isAccepted
    )
  }

  @Mutation(() => [AssignmentProblem])
  async importProblemsToAssignment(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args('problemIdsWithScore', { type: () => [AssignmentProblemScoreInput] })
    problemIdsWithScore: AssignmentProblemScoreInput[]
  ) {
    return await this.assignmentService.importProblemsToAssignment(
      groupId,
      assignmentId,
      problemIdsWithScore
    )
  }

  @Mutation(() => [AssignmentProblem])
  async removeProblemsFromAssignment(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('assignmentId', { type: () => Int })
    assignmentId: number,
    @Args('problemIds', { type: () => [Int] }) problemIds: number[]
  ) {
    return await this.assignmentService.removeProblemsFromAssignment(
      groupId,
      assignmentId,
      problemIds
    )
  }

  /**
   * 특정 User의 Assignment 제출 내용 요약 정보를 가져옵니다.
   *
   * Assignment Overall 페이지에서 특정 유저를 선택했을 때 사용
   * @see https://github.com/skkuding/codedang/pull/1894
   */
  @Query(() => AssignmentSubmissionSummaryForUser)
  async getAssignmentSubmissionSummaryByUserId(
    @Args('assignmentId', { type: () => Int }, IDValidationPipe)
    assignmentId: number,
    @Args('userId', { type: () => Int }, IDValidationPipe) userId: number,
    @Args('problemId', { nullable: true, type: () => Int }, IDValidationPipe)
    problemId: number,
    @Args(
      'take',
      { type: () => Int, defaultValue: 10 },
      new RequiredIntPipe('take')
    )
    take: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null
  ) {
    return await this.assignmentService.getAssignmentSubmissionSummaryByUserId(
      take,
      assignmentId,
      userId,
      problemId,
      cursor
    )
  }

  @Mutation(() => DuplicatedAssignmentResponse)
  async duplicateAssignment(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('assignmentId', { type: () => Int })
    assignmentId: number,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.assignmentService.duplicateAssignment(
      groupId,
      assignmentId,
      req.user.id
    )
  }

  /**
   * Assignment의 참여한 User와, 점수 요약을 함께 불러옵니다.
   *
   * Assignment Overall 페이지의 Participants 탭의 정보
   * @see https://github.com/skkuding/codedang/pull/2029
   */
  @Query(() => [UserAssignmentScoreSummaryWithUserInfo])
  async getAssignmentScoreSummaries(
    @Args(
      'assignmentId',
      { type: () => Int, nullable: false },
      IDValidationPipe
    )
    assignmentId: number,
    @Args('take', { type: () => Int, defaultValue: 10 })
    take: number,
    @Args('cursor', { type: () => Int, nullable: true }, CursorValidationPipe)
    cursor: number | null,
    @Args('searchingName', { type: () => String, nullable: true })
    searchingName?: string
  ) {
    return await this.assignmentService.getAssignmentScoreSummaries(
      assignmentId,
      take,
      cursor,
      searchingName
    )
  }

  @Query(() => AssignmentsGroupedByStatus)
  async getAssignmentsByProblemId(
    @Args('problemId', { type: () => Int }) problemId: number
  ) {
    return await this.assignmentService.getAssignmentsByProblemId(problemId)
  }
}
