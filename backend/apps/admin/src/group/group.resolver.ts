import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  ParseIntPipe
} from '@nestjs/common'
import { Args, Int, Query, Mutation, Resolver, Context } from '@nestjs/graphql'
import { Group } from '@generated'
import { Role } from '@prisma/client'
import { AuthenticatedRequest, UseRolesGuard } from '@libs/auth'
import {
  ConflictFoundException,
  DuplicateFoundException,
  ForbiddenAccessException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { GroupService } from './group.service'
import { CreateGroupInput, UpdateGroupInput } from './model/group.input'
import { DeletedUserGroup, FindGroup } from './model/group.output'

@Resolver(() => Group)
export class GroupResolver {
  private readonly logger = new Logger(GroupResolver.name)

  constructor(private readonly groupService: GroupService) {}

  @Mutation(() => Group)
  @UseRolesGuard(Role.Manager)
  async createGroup(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CreateGroupInput
  ) {
    try {
      return await this.groupService.createGroup(input, req.user.id)
    } catch (error) {
      if (error instanceof DuplicateFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [FindGroup])
  @UseRolesGuard()
  async getGroups(
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { type: () => Int }) take: number
  ) {
    return await this.groupService.getGroups(cursor, take)
  }

  @Query(() => FindGroup)
  async getGroup(@Args('groupId', { type: () => Int }) id: number) {
    return await this.groupService.getGroup(id)
  }

  @Mutation(() => Group)
  async updateGroup(
    @Args('groupId', { type: () => Int }) id: number,
    @Args('input') input: UpdateGroupInput
  ) {
    try {
      return await this.groupService.updateGroup(id, input)
    } catch (error) {
      if (error instanceof DuplicateFoundException) {
        throw new ConflictException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => DeletedUserGroup)
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
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => String)
  async issueInvitation(@Args('groupId', ParseIntPipe) id: number) {
    try {
      return await this.groupService.issueInvitation(id)
    } catch (error) {
      if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => String)
  async revokeInvitation(@Args('groupId', ParseIntPipe) id: number) {
    try {
      return await this.groupService.revokeInvitation(id)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
