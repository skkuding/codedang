import {
  ForbiddenException,
  InternalServerErrorException,
  UnprocessableEntityException
} from '@nestjs/common'
import { Args, Int, Query, Mutation, Resolver, Context } from '@nestjs/graphql'
import { Role } from '@prisma/client'
import { AuthenticatedRequest, UseRolesGuard } from '@libs/auth'
import {
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { Group } from '@admin/@generated/group/group.model'
import { GroupService } from './group.service'
import { CreateGroupInput, UpdateGroupInput } from './model/group.input'
import { DeletedUserGroup, FindGroup } from './model/group.output'

@Resolver(() => Group)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation(() => Group)
  @UseRolesGuard(Role.Manager)
  async createGroup(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CreateGroupInput
  ): Promise<Group> {
    try {
      return await this.groupService.createGroup(input, req.user.id)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [FindGroup])
  @UseRolesGuard()
  async getGroups(
    @Args('cursor', { nullable: true }, CursorValidationPipe) cursor: number,
    @Args('take', { type: () => Int }) take: number
  ): Promise<Partial<FindGroup>[]> {
    return await this.groupService.getGroups(cursor, take)
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
    try {
      return await this.groupService.updateGroup(id, input)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => DeletedUserGroup)
  async deleteGroup(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { type: () => Int }) id: number
  ): Promise<DeletedUserGroup> {
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
