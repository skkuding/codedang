import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { AdminUserService } from './user.service'
import { User } from '../@generated/user/user.model'
import { UserCreateInput } from '../@generated/user/user-create.input'
import { UserUpdateInput } from '../@generated/user/user-update.input'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: AdminUserService) {}

  @Mutation(() => User)
  createUsers(@Args('userCreateInput') userCreateInput: UserCreateInput) {
    return this.userService.create(userCreateInput)
  }

  @Query(() => [User], { name: 'user' })
  getUsers() {
    return this.userService.getAllUsers()
  }

  @Query(() => User, { name: 'user' })
  getUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.getUser(id)
  }

  @Mutation(() => User)
  updateUser(@Args('userUpdateInput') userUpdateInput: UserUpdateInput) {
    return this.userService.updateUser(1, userUpdateInput)
  }

  @Mutation(() => User)
  deleteUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.deleteUser(id)
  }
}
