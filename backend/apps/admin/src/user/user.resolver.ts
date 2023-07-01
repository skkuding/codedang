import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql'
import { UserGroup } from '@admin/@generated/user-group/user-group.model'
import { UserCreateInput } from '../@generated/user/user-create.input'
import { UserUpdateInput } from '../@generated/user/user-update.input'
import { User } from '../@generated/user/user.model'
import { GetUsersInput } from './dto/getUsersInput.dto'
import { GroupMember } from './dto/groupMember.dto'
import { UserService } from './user.service'

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

  @Query(() => [GroupMember], { name: 'getUsers' })
  getUsers(
    @Args('input', { type: () => GetUsersInput }) input
  ): Promise<GroupMember[]> {
    try {
      const { id, role, cursor, take } = input
      return this.userService.getUsers(id, role, cursor, take)
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

  @Mutation(() => UserGroup, { name: 'deleteGroupMember' })
  deleteGroupMember(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('groupId', { type: () => Int }) groupId: number
  ): Promise<UserGroup> {
    try {
      return this.userService.deleteGroupMember(userId, groupId)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  // @Query(() => [User], { name: 'getGroupMembersNeededApproval' })
  // getGroupMembersNeededApproval(
  //   @Args('groupId', { type: () => ID! }) groupId: string
  // ) {
  //   try {
  //     return this.userService.getGroupMEmbersNeededApproval(groupId)
  //   } catch (error) {

  //   }
  // }
}
