import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { UserService } from './user.service'
import { User } from '../@generated/user/user.model'
import { UserCreateInput } from '../@generated/user/user-create.input'
import { UserUpdateInput } from '../@generated/user/user-update.input'
import { UseGuards } from '@nestjs/common'
import { RolesGuard } from './guard/roles.guard'
import { Roles } from '@client/common/decorator/roles.decorator'
import { Role } from '@prisma/client'

@UseGuards(RolesGuard)
@Roles(Role.Admin)
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('userCreateInput') userCreateInput: UserCreateInput) {
    return this.userService.create(userCreateInput)
  }

  @Query(() => [User], { name: 'user' })
  findAll() {
    return this.userService.findAll()
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SuperAdmin)
  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id)
  }

  @Mutation(() => User)
  updateUser(@Args('userUpdateInput') userUpdateInput: UserUpdateInput) {
    return this.userService.update(1, userUpdateInput)
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.remove(id)
  }
}
