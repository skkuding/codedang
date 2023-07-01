import {
  ForbiddenException,
  InternalServerErrorException,
  UseGuards
} from '@nestjs/common'
import { Args, Int, Query, Mutation, Resolver, Context } from '@nestjs/graphql'
import { Role } from '@prisma/client'
import { AuthenticatedRequest, RolesGuard, UseRolesGuard } from '@libs/auth'
import { ForbiddenAccessException } from '@libs/exception'
import { Group } from '@admin/@generated/group/group.model'
import { GroupService } from './group.service'
import { CreateGroupInput, UpdateGroupInput } from './model/group.input'
import { FindGroup, FindManyGroup } from './model/group.output'

@Resolver(() => Group)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation(() => Group)
  @UseRolesGuard(Role.Manager)
  async createGroup(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CreateGroupInput
  ): Promise<Group> {
    return await this.groupService.createGroup(input, req.user.id)
  }

  @Query(() => [FindManyGroup])
  @UseGuards(RolesGuard)
  async getGroups(): Promise<Partial<FindManyGroup>[]> {
    return await this.groupService.getGroups()
  }

  @Query(() => FindGroup)
  async getGroup(
    @Args('groupId', { type: () => Int }) id: number
  ): Promise<FindGroup> {
    return await this.groupService.getGroup(id)
  }

  @Mutation(() => Group)
  async updateGroup(
    @Args('groupId', { type: () => Int }) id: number,
    @Args('input') input: UpdateGroupInput
  ): Promise<Group> {
    return await this.groupService.updateGroup(id, input)
  }

  @Mutation(() => String)
  async deleteGroup(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { type: () => Int }) id: number
  ) {
    try {
      return await this.groupService.deleteGroup(id, req.user)
    } catch (error) {
      if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
