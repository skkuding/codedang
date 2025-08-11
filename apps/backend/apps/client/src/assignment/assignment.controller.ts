import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  Req
} from '@nestjs/common'
import { AuthenticatedRequest } from '@libs/auth'
import { GroupIDPipe, IDValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { AssignmentService } from './assignment.service'

@Controller('assignment')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  /**
   * 특정 그룹의 모든 assignment 혹은 exercise를 가져옵니다
   *
   * @param {number} groupId 조회할 그룹 아이디
   * @param {boolean} isExercise exercise를 가져올지 혹은 assignment를 가져올지 여부
   * @param {number} month 조회할 월 (1-12, 선택적, 기본값: 현재 월)
   * @param {number} year 조회할 년도 (선택적, 기본값: 현재 년도)
   * @returns 조회된 모든 assignment
   */
  @Get('')
  async getAssignments(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('isExercise', new ParseBoolPipe({ optional: true }))
    isExercise?: boolean,
    @Query('month', new ParseIntPipe({ optional: true }))
    month?: number,
    @Query('year', new ParseIntPipe({ optional: true }))
    year?: number
  ) {
    return await this.assignmentService.getAssignments(
      groupId,
      isExercise,
      month,
      year
    )
  }

  /**
   * 유저가 참여하고 있는 경우에 한하여 assignment를 가져옵니다.
   *
   * @param {Request} req
   * @param {number} id 조회할 assignment 아이디
   * @returns 접근하는 유저가 assignment에 참여하고 있는 경우 해당 assignment를 반환합니다.
   */
  @Get(':id')
  async getAssignment(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.assignmentService.getAssignment(id, req.user.id)
  }

  /**
   * 특정 assignment에 요청을 보낸 유저를 참여시킵니다.
   *
   * @param {Request} req
   * @param {number} groupId assignment가 속한 그룹 아이디
   * @param {number} assignmentId 유저를 참여시킬 assignment 아이디
   * @returns 생성된 assignmentRecord를 반환합니다
   */
  @Post(':id/participation')
  async participateAssignment(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) assignmentId: number
  ) {
    return await this.assignmentService.createAssignmentRecord(
      assignmentId,
      req.user.id,
      groupId
    )
  }

  /**
   * 한 그룹에서 진행 중인 모든 assignment에 요청을 보낸 유저를 참여시킵니다.
   *
   * @param {Request} req
   * @param {number} groupId 그룹 아이디
   * @returns 유저가 참여하게 된 모든 assignment의 아이디를 반환합니다.
   */
  @Post('/participation')
  async participateAllOngoingAssignments(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.assignmentService.participateAllOngoingAssignments(
      groupId,
      req.user.id
    )
  }

  /**
   * 유저를 특정 assignment에서 제외합니다.
   * upcoming assignment에 대해서만 등록을 취소할 수 있습니다.
   *
   * @param {Request} req
   * @param {number} groupId assignment가 속한 그룹 아이디
   * @param {number} assignmentId 유저를 제외할 assignment 아이디
   * @returns 제거된 assignment record를 반환합니다.
   */
  @Delete(':id/participation')
  async deleteAssignmentRecord(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) assignmentId: number
  ) {
    return await this.assignmentService.deleteAssignmentRecord(
      assignmentId,
      req.user.id,
      groupId
    )
  }

  /**
   * 특정 assignment에서 모든 참여자의 점수를 익명화해 가져옵니다.
   * Autofinalize가 true인 경우 score를 finalScore로 사용합니다.
   * isFinalScoreVisible이 false인 경우 finalScore를 null로 설정합니다.
   *
   * @param {number} groupId 접근하려는 assignment의 그룹 아이디
   * @param {number} assignmentId assignment 아이디
   * @returns 익명화된 모든 참여자의 최종 점수를 반환합니다.
   */
  @Get(':id/anonymized-scores')
  async getAnonymizedScores(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) assignmentId: number
  ) {
    return await this.assignmentService.getAnonymizedScores(
      assignmentId,
      groupId
    )
  }

  /**
   * 한 과제에서 특정 사용자의 모든 problem record를 가져옵니다.
   * 문제별 점수, 제출 여부, 코멘트를 포함합니다.
   *
   * @param {Request} req
   * @param {number} assignmentId
   * @returns 한 과제에서 사용자의 모든 과제 기록을 반환합니다.
   */
  @Get(':id/me')
  async getMyAssignmentProblemRecord(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) assignmentId: number
  ) {
    return await this.assignmentService.getMyAssignmentProblemRecord(
      assignmentId,
      req.user.id
    )
  }

  /**
   * 한 그룹에서 특정 유저의 모든 assignment 결과를 요약해 가져옵니다.
   * 요약한 내용에는 assignment 아이디, 문제/제출 수, 문제 별 점수의 총합, 최종 점수가 포함됩니다.
   *
   * @param {Request} req
   * @param {number} groupId 조회하려는 그룹 아이디
   * @param {boolean} isExercise exercise의 요약을 가져올지 여부
   * @returns 한 그룹에서 특정 유저의 assignment 별 결과를 요약해 반환합니다.
   */
  @Get('/me/summary')
  async getMyAssignmentsSummary(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query(
      'isExercise',
      new ParseBoolPipe({ optional: true }),
      new DefaultValuePipe(false)
    )
    isExercise: boolean
  ) {
    return await this.assignmentService.getMyAssignmentsSummary(
      groupId,
      req.user.id,
      isExercise
    )
  }
}
