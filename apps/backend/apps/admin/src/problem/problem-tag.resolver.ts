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
    return await this.problemService.createTag(tagName)
  }

  @Mutation(() => Tag)
  async deleteTag(@Args('tagName', { type: () => String }) tagName: string) {
    return await this.problemService.deleteTag(tagName)
  }

  @Query(() => [Tag])
  async getTags() {
    return await this.problemService.getTags()
  }
}
