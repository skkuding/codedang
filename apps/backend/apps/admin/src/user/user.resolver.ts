import {
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { OPEN_SPACE_ID } from '@libs/constants'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { UserGroup } from '@admin/@generated'
import { User } from '@admin/@generated'
import { GroupMember } from './model/groupMember.model'
import { UserService } from './user.service'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(UserResolver.name)

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

  @Mutation(() => UserGroup)
  async updateGroupMember(
    @Args('userId', { type: () => Int }, new RequiredIntPipe('userId'))
    userId: number,
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('toGroupLeader') toGroupLeader: boolean
  ) {
    try {
      return await this.userService.updateGroupRole(
        userId,
        groupId,
        toGroupLeader
      )
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message)
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup)
  async deleteGroupMember(
    @Args('userId', { type: () => Int }, new RequiredIntPipe('userId'))
    userId: number,
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number
  ) {
    try {
      return await this.userService.deleteGroupMember(userId, groupId)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message)
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [User])
  async getJoinRequests(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number
  ) {
    try {
      return await this.userService.getJoinRequests(groupId)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup)
  async handleJoinRequest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('userId', { type: () => Int }, new RequiredIntPipe('userId'))
    userId: number,
    @Args('isAccept') isAccept: boolean
  ) {
    try {
      return await this.userService.handleJoinRequest(groupId, userId, isAccept)
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
