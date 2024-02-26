import {
  InternalServerErrorException,
  Logger,
  ParseArrayPipe
} from '@nestjs/common'
import {
  Query,
  Resolver,
  ResolveField,
  Parent,
  Mutation,
  Args
} from '@nestjs/graphql'
import { ProblemTag, Tag } from '@generated'
import { DuplicateFoundException } from '@libs/exception'
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

  @Mutation(() => [Tag])
  async createTags(
    @Args('tagNames', { type: () => [String] }, ParseArrayPipe)
    tagNames: string[]
  ) {
    try {
      return await this.problemService.createTags(tagNames)
    } catch (error) {
      if (error instanceof DuplicateFoundException) {
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
