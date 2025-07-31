import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql'
import { UserGroup } from '@generated'
import { User } from '@generated'
import { UseGroupLeaderGuard } from '@libs/auth'
import { AuthenticatedRequest } from '@libs/auth'
import { UnprocessableDataException } from '@libs/exception'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { UpdateCreationPermissionsInput } from './model/creationPermission.model'
import { GroupMember } from './model/groupMember.model'
import { UpdateCreationPermissionResult } from './model/user.output'
import { UserService, GroupMemberService } from './user.service'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * 이메일 또는 학번으로 사용자를 조회합니다.
   *
   * @param {number} _groupId - 그룹의 ID (필터링 목적).
   * @param {string} email - 조회할 사용자의 이메일 (선택적).
   * @param {string} studentId - 조회할 사용자의 학번 (선택적).
   * @returns {Promise<User[]>} - 조회된 사용자 목록을 반환합니다.
   */
  @Query(() => [User])
  @UseGroupLeaderGuard()
  async getUserByEmailOrStudentId(
    @Args('groupId', { type: () => Int }, GroupIDPipe) _groupId: number,
    @Args('email', { type: () => String, nullable: true })
    email?: string,
    @Args('studentId', { type: () => String, nullable: true })
    studentId?: string
  ) {
    if (!!email === !!studentId) {
      throw new UnprocessableDataException(
        'Either email or studentId must be provided, but not both.'
      )
    }

    return await this.userService.getUserByEmailOrStudentId(email, studentId)
  }

  @Mutation(() => UpdateCreationPermissionResult)
  async updateCreationPermissions(
    @Args('input') input: UpdateCreationPermissionsInput
  ) {
    return await this.userService.updateCreationPermissions(input)
  }

  @Query(() => [User])
  async getUsers(
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args(
      'take',
      { type: () => Int, defaultValue: 10 },
      new RequiredIntPipe('take')
    )
    take: number
  ) {
    return await this.userService.getUsers({
      cursor,
      take
    })
  }
}

@Resolver(() => GroupMember)
@UseGroupLeaderGuard()
export class GroupMemberResolver {
  constructor(private readonly groupMemberService: GroupMemberService) {}

  /**
   * 특정 그룹의 멤버를 페이지네이션과 필터링 조건에 따라 조회함.
   *
   * @param {number} groupId - 그룹의 ID.
   * @param {number | null} cursor - 페이지네이션을 위한 커서. 선택적 매개변수임
   * @param {number} take - 가져올 그룹 멤버의 수. 기본값은 10.
   * @param {boolean} leaderOnly - 그룹의 리더만 필터링 해주는 플래그. 기본 값은 false
   * @returns {Promise<GroupMember[]>} - 그룹 멤버 리스트를 리턴함.
   */
  @Query(() => [GroupMember])
  async getGroupMembers(
    @Args('groupId', { type: () => Int }, GroupIDPipe)
    groupId: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args(
      'take',
      { type: () => Int, defaultValue: 10 },
      new RequiredIntPipe('take')
    )
    take: number,
    @Args('leaderOnly', { defaultValue: false }) leaderOnly: boolean
  ) {
    return await this.groupMemberService.getGroupMembers({
      groupId,
      cursor,
      take,
      leaderOnly
    })
  }

  /**
   * 특정 그룹에서 사용자 ID를 기반으로 그룹 멤버를 조회함.
   *
   * @param {number} groupId - 그룹의 ID.
   * @param {number} userId - 조회할 사용자의 ID.
   * @returns {Promise<GroupMember>} 그룹 멤버 객체를 리턴함.
   */
  @Query(() => GroupMember)
  async getGroupMember(
    @Args('groupId', { type: () => Int }, GroupIDPipe)
    groupId: number,
    @Args('userId', { type: () => Int }, new RequiredIntPipe('userId'))
    userId: number
  ) {
    return await this.groupMemberService.getGroupMember(groupId, userId)
  }

  /**
   * 특정 그룹 멤버를 리더로 업데이트함
   *
   * @param {number} userId - 역할을 업데이트 할 사용자의 ID.
   * @param {number} groupId - 업데이트 대상 그룹의 ID.
   * @param {boolean} toGroupLeader - 사용자를 리더로 설정할지에 대한 플래그
   * @returns {Promise<UserGroup>} 업데이트된 그룹 멤버 객체를 리턴.
   */
  @Mutation(() => UserGroup)
  async updateGroupMember(
    @Args('userId', { type: () => Int }, new RequiredIntPipe('userId'))
    userId: number,
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('toGroupLeader') toGroupLeader: boolean,
    @Context('req') req: AuthenticatedRequest
  ) {
    // 요청 객체에서 현재 사용자 ID 가져오기
    const currentUserId = req.user.id

    // 자기 자신의 role을 변경하려는 경우 에러 발생
    if (currentUserId === userId) {
      throw new UnprocessableDataException(
        'You cannot change your own role. Please ask another instructor to change your role.'
      )
    }

    return await this.groupMemberService.updateGroupRole(
      userId,
      groupId,
      toGroupLeader
    )
  }

  /**
   * 특정 사용자를 그룹에서 제거.
   *
   * @param {number} userId - 제거할 사용자의 id
   * @param {number} groupId - 대상 그룹의 id
   * @returns {Promise<UserGroup>} 삭제된 그룹 멤버 객체를 리턴.
   */
  @Mutation(() => UserGroup)
  async deleteGroupMember(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('userId', { type: () => Int }) userId: number
  ) {
    return await this.groupMemberService.deleteGroupMember(groupId, userId)
  }

  /**
   * 특정 그룹에 가입 요청한 유저 리스트를 조회.
   * @param {number} groupId - 특정 그룹의 id.
   * @returns {Promise<User[]>} 가입 요청한 유저 리스트를 리턴.
   */
  @Query(() => [User])
  async getJoinRequests(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number
  ) {
    return await this.groupMemberService.getJoinRequests(groupId)
  }

  /**
   * 그룹 가입 요청을 처리.
   *
   * @param {number} groupId
   * @param {number} userId
   * @param {boolean} isAccept - 요청 승인에 대한 플래그.
   * @returns {Promise<UserGroup>}
   */
  @Mutation(() => UserGroup)
  async handleJoinRequest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('userId', { type: () => Int }, new RequiredIntPipe('userId'))
    userId: number,
    @Args('isAccept') isAccept: boolean
  ) {
    return await this.groupMemberService.handleJoinRequest(
      groupId,
      userId,
      isAccept
    )
  }
}
