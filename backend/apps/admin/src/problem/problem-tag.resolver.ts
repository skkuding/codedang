import { InternalServerErrorException, Logger } from '@nestjs/common'
import {
  Query,
  Resolver,
  ResolveField,
  Parent,
  Mutation,
  Args
} from '@nestjs/graphql'
import { ProblemTag, Tag } from '@generated'
import {
  DuplicateFoundException,
  EntityNotExistException
} from '@libs/exception'
import { ProblemService } from './problem.service'

@Resolver(() => ProblemTag)
export class ProblemTagResolver {
  private readonly logger = new Logger(ProblemTagResolver.name)

  constructor(private readonly problemService: ProblemService) {}

  @ResolveField('tag', () => Tag)
  async getTag(@Parent() problemTag: ProblemTag) {
    try {
      return await this.problemService.getTag(problemTag.tagId)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}

@Resolver(() => Tag)
export class TagResolver {
  private readonly logger = new Logger(TagResolver.name)

  constructor(private readonly problemService: ProblemService) {}

  @Mutation(() => Tag)
  async createTag(
    @Args('tagName', { type: () => String })
    tagName: string
  ) {
    try {
      return await this.problemService.createTag(tagName)
    } catch (error) {
      if (error instanceof DuplicateFoundException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Tag)
  async updateTag(
    @Args('oldTagName', { type: () => String })
    oldTagName: string,
    @Args('newTagName', { type: () => String })
    newTagName: string
  ) {
    try {
      return await this.problemService.updateTag(oldTagName, newTagName)
    } catch (error) {
      if (
        error instanceof EntityNotExistException ||
        error instanceof DuplicateFoundException
      ) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Tag)
  async deleteTag(@Args('tagName', { type: () => String }) tagName: string) {
    try {
      return await this.problemService.deleteTag(tagName)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [Tag])
  async getTags() {
    try {
      return await this.problemService.getTags()
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
