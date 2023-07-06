import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { Role } from '@admin/@generated/prisma/role.enum'
import { UserGroup } from '@admin/@generated/user-group/user-group.model'
import { User } from '../@generated/user/user.model'
import { GetUsersInput } from './dto/getUsersInput.dto'
import { GroupMember } from './dto/groupMember.dto'
import { JoinInput } from './dto/joinInput.dto'
import { UserService } from './user.service'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [GroupMember], { name: 'getUsers' })
  getUsers(
    @Args('input', { type: () => GetUsersInput }) input,
    @Args('role', { type: () => Role }) role
  ): Promise<GroupMember[]> {
    try {
      const { id, cursor, take } = input
      return this.userService.getUsers(id, role, cursor, take)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException()
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup, { name: 'downgradeGroupManager' })
  downgradeGroupManager(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('groupId', { type: () => Int }) groupId: number
  ): Promise<UserGroup> {
    try {
      return this.userService.downgradeManager(userId, groupId)
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

  @Mutation(() => UserGroup, { name: 'upgradeGroupMember' })
  upgradeGroupMember(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('groupId', { type: () => Int }) groupId: number
  ): Promise<UserGroup> {
    try {
      return this.userService.upgradeManager(userId, groupId)
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

  @Mutation(() => UserGroup, { name: 'deleteGroupMember' })
  deleteGroupMember(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('groupId', { type: () => Int }) groupId: number
  ): Promise<UserGroup> {
    try {
      return this.userService.deleteGroupMember(userId, groupId)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException()
      }
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [User], { name: 'getNeededApproval' })
  getNeededApproval(
    @Args('groupId', { type: () => ID }) groupId: string
  ): Promise<User[]> {
    try {
      return this.userService.getNeededApproval(groupId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Number, { name: 'rejectJoin' })
  rejectJoin(@Args('input') input: JoinInput): Promise<number> {
    try {
      const { groupId, userId } = input
      return this.userService.rejectJoin(groupId, userId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => UserGroup, { name: 'acceptJoin' })
  acceptJoin(@Args('input') input: JoinInput): Promise<UserGroup> {
    try {
      const { groupId, userId } = input
      return this.userService.acceptJoin(groupId, userId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }
}
