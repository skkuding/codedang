import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { UserCreateInput } from '../@generated/user/user-create.input'
import { UserUpdateInput } from '../@generated/user/user-update.input'
import { User } from '../@generated/user/user.model'
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

  @Mutation(() => User, { name: 'updateUser' })
  updateUser(
    @Args('id') id: number,
    @Args('userUpdateInput') userUpdateInput: UserUpdateInput
  ): Promise<User> {
    return this.userService.updateUser(id, userUpdateInput)
  }

  @Mutation(() => User, { name: 'deleteUser' })
  deleteUser(@Args('id', { type: () => Int }) id: number): Promise<User> {
    return this.userService.deleteUser(id)
  }
}
