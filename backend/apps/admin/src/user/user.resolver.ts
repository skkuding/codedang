import {
  BadRequestException,
  InternalServerErrorException,
  ParseIntPipe
} from '@nestjs/common'
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { User } from '@generated'
import { OPEN_SPACE_ID } from '@libs/constants'
import { CursorValidationPipe } from '@libs/pipe'
import { UserGroup } from '@admin/@generated/user-group/user-group.model'
import { GroupMember } from './dto/groupMember.dto'
import { JoinInput } from './dto/joinInput.dto'
import { UserService } from './user.service'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [GroupMember])
  async getMembers(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('cursor', CursorValidationPipe) cursor: number,
    @Args('take', ParseIntPipe) take: number,
    @Args('isGroupLeader') isGroupLeader: boolean
  ): Promise<GroupMember[]> {
    return await this.userService.getGroupMembers(
      groupId,
      cursor,
      take,
      isGroupLeader
    )
  }

  @Mutation(() => UserGroup)
  async downgradeGroupManager(
    @Args('userId') userId: number,
    @Args('groupId') groupId: number
  ): Promise<UserGroup> {
    try {
      return await this.userService.updateGroupMemberRole(
        userId,
        groupId,
        false
      )
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException()
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup)
  async upgradeGroupMember(
    @Args('userId') userId: number,
    @Args('groupId') groupId: number
  ): Promise<UserGroup> {
    try {
      return await this.userService.updateGroupMemberRole(userId, groupId, true)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException()
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup)
  async deleteGroupMember(
    @Args('userId') userId: number,
    @Args('groupId') groupId: number
  ): Promise<UserGroup> {
    try {
      return await this.userService.deleteGroupMember(userId, groupId)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException()
      }
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [User])
  async getJoinRequests(@Args('groupId') groupId: string): Promise<User[]> {
    try {
      return await this.userService.getNeededApproval(groupId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Number)
  async rejectJoinRequest(
    @Args('input') input: JoinInput
  ): Promise<UserGroup | number> {
    try {
      const { groupId, userId } = input
      return await this.userService.handleJoinRequest(groupId, userId, false)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException()
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup)
  async acceptJoinRequest(
    @Args('input') input: JoinInput
  ): Promise<UserGroup | number> {
    try {
      const { groupId, userId } = input
      return await this.userService.handleJoinRequest(groupId, userId, true)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException()
      }
      throw new InternalServerErrorException()
    }
  }
}
