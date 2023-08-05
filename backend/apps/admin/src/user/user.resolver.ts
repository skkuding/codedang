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
import { GroupMember } from './model/groupMember.model'
import type { UpdateUserGroup } from './model/userGroup-update.model'
import { UserService } from './user.service'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [GroupMember])
  async getGroupMembers(
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
  ): Promise<UpdateUserGroup> {
    try {
      return await this.userService.updateGroupMemberRole(
        userId,
        groupId,
        false
      )
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup)
  async upgradeGroupMember(
    @Args('userId') userId: number,
    @Args('groupId') groupId: number
  ): Promise<UpdateUserGroup> {
    try {
      return await this.userService.updateGroupMemberRole(userId, groupId, true)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message)
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
        throw new BadRequestException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [User])
  async getJoinRequests(@Args('groupId') groupId: number): Promise<User[]> {
    try {
      return await this.userService.getNeededApproval(groupId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup)
  async rejectJoinRequest(
    @Args('groupId') groupId: number,
    @Args('userId') userId: number
  ): Promise<UserGroup | number> {
    try {
      return await this.userService.handleJoinRequest(groupId, userId, false)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup)
  async acceptJoinRequest(
    @Args('groupId') groupId: number,
    @Args('userId') userId: number
  ): Promise<UserGroup | number> {
    try {
      return await this.userService.handleJoinRequest(groupId, userId, true)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
