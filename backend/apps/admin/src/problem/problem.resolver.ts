import {
  BadRequestException,
  InternalServerErrorException,
  ParseIntPipe
} from '@nestjs/common'
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest } from '@libs/auth'
import {
  InvalidFileFormatException,
  UnprocessableDataException
} from '@libs/exception'
import { Problem } from '@admin/@generated/problem/problem.model'
import { FileUploadInput } from './model/problem.input'
import { FileUploadOutput } from './model/problem.output'
import { ProblemService } from './problem.service'

@Resolver(() => Problem)
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Mutation(() => [FileUploadOutput])
  async uploadProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { nullable: false }, ParseIntPipe) groupId: number,
    @Args('input') input: FileUploadInput
  ): Promise<Problem[]> {
    try {
      return await this.problemService.importProblems(
        req.user.id,
        groupId,
        input
      )
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new BadRequestException(error.message)
      } else if (error instanceof InvalidFileFormatException) {
        throw new BadRequestException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
