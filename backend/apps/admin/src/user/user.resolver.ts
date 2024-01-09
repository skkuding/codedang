import {
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Logger,
  ParseIntPipe,
  NotFoundException
} from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { User } from '@generated'
import { OPEN_SPACE_ID } from '@libs/constants'
import { CursorValidationPipe } from '@libs/pipe'
import { UserGroup } from '@admin/@generated/user-group/user-group.model'
import { GroupMember } from './model/groupMember.model'
import { UserService } from './user.service'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(UserResolver.name)

  @Query(() => [GroupMember])
  async getGroupMembers(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', ParseIntPipe) take: number,
    @Args('leaderOnly', { defaultValue: false }) leaderOnly: boolean
  ) {
    return await this.userService.getGroupMembers(
      groupId,
      cursor,
      take,
      leaderOnly
    )
  }

  @Mutation(() => UserGroup)
  async updateGroupMember(
    @Args('userId') userId: number,
    @Args('groupId') groupId: number,
    @Args('toGroupLeader') toGroupLeader: boolean
  ) {
    try {
      return await this.userService.updateGroupRole(
        userId,
        groupId,
        toGroupLeader
      )
    } catch (error) {
      this.logger.error(error.message, error.stack)
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message)
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup)
  async deleteGroupMember(
    @Args('userId') userId: number,
    @Args('groupId') groupId: number
  ) {
    try {
      return await this.userService.deleteGroupMember(userId, groupId)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message)
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [User])
  async getJoinRequests(@Args('groupId') groupId: number) {
    try {
      return await this.userService.getJoinRequests(groupId)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup)
  async handleJoinRequest(
    @Args('groupId') groupId: number,
    @Args('userId') userId: number,
    @Args('isAccept') isAccept: boolean
  ) {
    try {
      return await this.userService.handleJoinRequest(groupId, userId, isAccept)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
