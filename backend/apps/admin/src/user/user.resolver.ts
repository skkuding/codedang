import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ParseIntPipe
} from '@nestjs/common'
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { User } from '@generated'
import { Prisma } from '@prisma/client'
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
    try {
      return await this.userService.getGroupMembers(
        groupId,
        cursor,
        take,
        isGroupLeader
      )
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException()
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup)
  async downgradeGroupManager(
    @Args('userId') userId: number,
    @Args('groupId') groupId: number
  ): Promise<UserGroup> {
    try {
      return await this.userService.downgradeManager(userId, groupId)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2015') {
          console.log('A related record could not be found.')
        } else {
          console.log('Invalid userId of groupId')
        }
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
      return await this.userService.upgradeMember(userId, groupId)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException()
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2015') {
          console.log('A related record could not be found.')
        }
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
      if (error instanceof NotFoundException) {
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
      throw new InternalServerErrorException()
    }
  }
}
