import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { UserService } from './user.service'
import { User } from '../@generated/user/user.model'
import { UserCreateInput } from '../@generated/user/user-create.input'
import { UserUpdateInput } from '../@generated/user/user-update.input'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUsers(
    @Args('userCreateInput') userCreateInput: UserCreateInput
  ): Promise<User> {
    return this.userService.createUser(userCreateInput)
  }

  @Query(() => [User], { name: 'user' })
  getUsers(): Promise<User[]> {
    return this.userService.getAllUsers()
  }

  @Query(() => User, { name: 'user' })
  getUser(@Args('id', { type: () => Int }) id: number): Promise<User> {
    return this.userService.getUser(id)
  }

  @Mutation(() => User)
  updateUser(
    @Args('id') id: number,
    @Args('userUpdateInput') userUpdateInput: UserUpdateInput
  ): Promise<User> {
    return this.userService.updateUser(id, userUpdateInput)
  }

  @Mutation(() => User)
  deleteUser(@Args('id', { type: () => Int }) id: number): Promise<User> {
    return this.userService.deleteUser(id)
  }
}
