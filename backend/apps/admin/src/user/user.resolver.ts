import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { UserService } from './user.service'
import { User } from '../@generated/user/user.model'
import { UserCreateInput } from '../@generated/user/user-create.input'
import { UserUpdateInput } from '../@generated/user/user-update.input'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') userCreateInput: UserCreateInput) {
    return this.userService.create(userCreateInput)
  }

  @Query(() => [User], { name: 'user' })
  findAll() {
    return this.userService.findAll()
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id)
  }

  @Mutation(() => User)
  updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateUserInput') userUpdateInput: UserUpdateInput
  ) {
    return this.userService.update(id, userUpdateInput)
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.remove(id)
  }
}
