import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { UserGroup } from '@generated'
import { User } from '@generated'
import { OPEN_SPACE_ID } from '@libs/constants'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { GroupMember } from './model/groupMember.model'
import { UserService } from './user.service'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * 특정 그룹의 멤버를 페이지네이션과 필터링 조건에 따라 조회함.
   *
   * @param {number} groupId - 그룹의 ID. 기본 값은 OPEN_SPACE_ID.
   * @param {number | null} cursor - 페이지네이션을 위한 커서. 선택적 매개변수임
   * @param {number} take - 가져올 그룹 멤버의 수. 기본값은 10.
   * @param {boolean} leaderOnly - 그룹의 리더만 필터링 해주는 플래그. 기본 값은 false
   * @returns {Promise<GroupMember[]>} - 그룹 멤버 리스트를 리턴함.
   */
  @Query(() => [GroupMember])
  async getGroupMembers(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
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
    return await this.userService.getGroupMembers(
      groupId,
      cursor,
      take,
      leaderOnly
    )
  }

  /**
   * 특정 그룹에서 사용자 ID를 기반으로 그룹 멤버를 조회함.
   *
   * @param {number} groupId - 그룹의 ID. 기본 값은 OPEN_SPACE_ID.
   * @param {number} userId - 조회할 사용자의 ID.
   * @returns {Promise<GroupMember>} 그룹 멤버 객체를 리턴함.
   */
  @Query(() => GroupMember)
  async getGroupMember(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('userId', { type: () => Int }, new RequiredIntPipe('userId'))
    userId: number
  ) {
    return await this.userService.getGroupMember(groupId, userId)
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
    @Args('toGroupLeader') toGroupLeader: boolean
  ) {
    return await this.userService.updateGroupRole(
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
    @Args('userId', { type: () => Int }, new RequiredIntPipe('userId'))
    userId: number,
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number
  ) {
    return await this.userService.deleteGroupMember(userId, groupId)
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
    return await this.userService.getJoinRequests(groupId)
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
    return await this.userService.handleJoinRequest(groupId, userId, isAccept)
  }
}
