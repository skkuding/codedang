import { DefaultValuePipe } from '@nestjs/common'
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
  Assignment,
  AssignmentProblem,
  AssignmentProblemRecord
} from '@generated'
import {
  AuthenticatedRequest,
  UseDisableGroupLeaderGuard,
  UseGroupLeaderGuard
} from '@libs/auth'
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { AssignmentService } from './assignment.service'
import { UpdateAssignmentProblemRecordInput } from './model/assignment-problem-record-input'
import { AssignmentProblemInput } from './model/assignment-problem.input'
import { AssignmentSubmissionSummaryForUser } from './model/assignment-submission-summary-for-user.model'
import { AssignmentWithParticipants } from './model/assignment-with-participants.model'
import {
  CreateAssignmentInput,
  UpdateAssignmentInput
} from './model/assignment.input'
import { AssignmentsGroupedByStatus } from './model/assignments-grouped-by-status.output'
import { DuplicatedAssignmentResponse } from './model/duplicated-assignment-response.output'
import { UserAssignmentScoreSummaryWithUserInfo } from './model/score-summary'

@Resolver(() => Assignment)
@UseGroupLeaderGuard()
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
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args(
      'isExercise',
      { nullable: true, type: () => Boolean },
      new DefaultValuePipe(false)
    )
    isExercise: boolean
  ) {
    return await this.assignmentService.getAssignments(
      take,
      groupId,
      cursor,
      isExercise
    )
  }

  @Query(() => AssignmentWithParticipants)
  async getAssignment(
    @Args(
      'assignmentId',
      { type: () => Int },
      new RequiredIntPipe('assignmentId')
    )
    assignmentId: number,

    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number
  ) {
    return await this.assignmentService.getAssignment(assignmentId, groupId)
  }

  @Mutation(() => Assignment)
  async createAssignment(
    @Args('input') input: CreateAssignmentInput,
    @Args('groupId', { type: () => Int }, GroupIDPipe)
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

  @Mutation(() => [AssignmentProblem])
  async importProblemsToAssignment(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args('assignmentProblemInput', { type: () => [AssignmentProblemInput] })
    assignmentProblemInput: AssignmentProblemInput[]
  ) {
    return await this.assignmentService.importProblemsToAssignment(
      groupId,
      assignmentId,
      assignmentProblemInput
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
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
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
    return await this.assignmentService.getAssignmentSubmissionSummaryByUserId({
      take,
      assignmentId,
      userId,
      problemId,
      cursor
    })
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
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('take', { type: () => Int, defaultValue: 10 })
    take: number,
    @Args('cursor', { type: () => Int, nullable: true }, CursorValidationPipe)
    cursor: number | null,
    @Args('searchingName', { type: () => String, nullable: true })
    searchingName?: string
  ) {
    return await this.assignmentService.getAssignmentScoreSummaries(
      assignmentId,
      groupId,
      take,
      cursor,
      searchingName
    )
  }

  @Query(() => AssignmentsGroupedByStatus)
  @UseDisableGroupLeaderGuard()
  async getAssignmentsByProblemId(
    @Args('problemId', { type: () => Int }) problemId: number,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.assignmentService.getAssignmentsByProblemId(
      problemId,
      req.user.id
    )
  }

  @Mutation(() => AssignmentProblemRecord)
  async updateAssignmentProblemRecord(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('input') input: UpdateAssignmentProblemRecordInput
  ) {
    return await this.assignmentService.updateAssignmentProblemRecord(
      groupId,
      input
    )
  }

  @Query(() => AssignmentProblemRecord)
  async getAssignmentProblemRecord(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args('userId', { type: () => Int }) userId: number,
    @Args('problemId', { type: () => Int }) problemId: number
  ) {
    return await this.assignmentService.getAssignmentProblemRecord({
      groupId,
      assignmentId,
      problemId,
      userId
    })
  }

  @Mutation(() => Number)
  async autoFinalizeScore(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number
  ) {
    return await this.assignmentService.autoFinalizeScore(groupId, assignmentId)
  }
}
