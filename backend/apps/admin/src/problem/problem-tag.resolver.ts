import { InternalServerErrorException, Logger } from '@nestjs/common'
import { Query, Resolver, ResolveField, Parent } from '@nestjs/graphql'
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
