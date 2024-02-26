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

  @Mutation(() => [Tag])
  async createTags(
    @Args('tagNames', { type: () => [String] }, ParseArrayPipe)
    tagNames: string[]
  ) {
    try {
      // 각 태그 이름을 원하는 형식으로 변환
      const formattedTagNames = tagNames.map(
        (tagName) =>
          tagName
            .replace(/\s+/g, '-') // 띄어쓰기를 '-'로 대체
            .toLowerCase() // 모든 영문자를 소문자로 변환
      )

      return await this.problemService.createTags(formattedTagNames)
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
      // 각 태그 이름을 원하는 형식으로 변환
      const formattedOldTagName = oldTagName
        .replace(/\s+/g, '-') // 띄어쓰기를 '-'로 대체
        .toLowerCase() // 모든 영문자를 소문자로 변환
      const formattedNewTagName = newTagName
        .replace(/\s+/g, '-') // 띄어쓰기를 '-'로 대체
        .toLowerCase() // 모든 영문자를 소문자로 변환

      return await this.problemService.updateTag(
        formattedOldTagName,
        formattedNewTagName
      )
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
      const formattedTagName = tagName
        .replace(/\s+/g, '-') // 띄어쓰기를 '-'로 대체
        .toLowerCase() // 모든 영문자를 소문자로 변환
      return await this.problemService.deleteTag(formattedTagName)
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
