import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { UserService } from './user.service'
import { User } from '../@generated/user/user.model'
import { UserCreateInput } from '../@generated/user/user-create.input'
import { UserUpdateInput } from '../@generated/user/user-update.input'
import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { GroupMember } from './dto/groupmember.dto'
import { UserGroup } from '@admin/@generated/user-group/user-group.model'
import { EntityNotExistException } from '@client/common/exception/business.exception'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User, { name: 'createUser' })
  createUser(
    @Args('userCreateInput') userCreateInput: UserCreateInput
  ): Promise<User> {
    return this.userService.createUser(userCreateInput)
  }

  @Query(() => [User], { name: 'getAllUsers' })
  getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers()
  }

  @Query(() => User, { name: 'getUser' })
  getUser(@Args('id', { type: () => Int }) id: number): Promise<User> {
    return this.userService.getUser(id)
  }

  @Query(() => [GroupMember], { name: 'groupManagerList' })
  getGroupManagerList(
    @Args('cursor', { type: () => Int }) cursor: number,
    @Args('take', { type: () => Int }) take: number,
    @Args('groupId', { type: () => Int }) groupId: number
  ): Promise<GroupMember[]> {
    try {
      return this.userService.getGroupManagers(cursor, take, groupId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [GroupMember], { name: 'groupMemberList' })
  groupMemberList(
    @Args('cursor', { type: () => Int }) cursor: number,
    @Args('take', { type: () => Int }) take: number,
    @Args('groupId', { type: () => Int }) groupId: number
  ): Promise<GroupMember[]> {
    try {
      return this.userService.getGroupMembers(cursor, take, groupId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Query(() => UserGroup, { name: 'groupManagerDowngrade' })
  downgradeGroupManager(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('groupId', { type: () => Int }) groupId: number
  ): Promise<UserGroup> {
    try {
      return this.userService.upOrDowngradeManager(userId, groupId, false)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Query(() => UserGroup, { name: 'groupManagerUpgrade' })
  upgradeGroupManager(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('groupId', { type: () => Int }) groupId: number
  ): Promise<UserGroup> {
    try {
      return this.userService.upOrDowngradeManager(userId, groupId, true)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => User, { name: 'updateUser' })
  updateUser(
    @Args('id') id: number,
    @Args('userUpdateInput') userUpdateInput: UserUpdateInput
  ): Promise<User> {
    return this.userService.updateUser(id, userUpdateInput)
  }

  @Mutation(() => User, { name: 'deleteGroupMember' })
  deleteGroupMember(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('groupId', { type: () => Int }) groupId: number
  ) {
    try {
      this.userService.deleteGroupMember(userId, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
