import {
  BadRequestException,
  InternalServerErrorException,
  ParseIntPipe
} from '@nestjs/common'
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { Problem } from '@admin/@generated/problem/problem.model'
import { AuthenticatedRequest } from '../../../../libs/auth/src/authenticated-request.interface'
import { ActionNotAllowedException } from '../../../../libs/exception/src/business.exception'
import { FileUploadInput } from './model/file-upload.input'
import { UploadedProblems } from './model/file-upload.output'
import { ProblemService } from './problem.service'

@Resolver(() => Problem)
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Mutation(() => UploadedProblems)
  async uploadProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { nullable: false }, ParseIntPipe) groupId: number,
    @Args('input') input: FileUploadInput
  ) {
    try {
      return await this.problemService.problemImport(
        req.user.id,
        groupId,
        input
      )
    } catch (error) {
      if (error instanceof ActionNotAllowedException) {
        throw new BadRequestException(error.message)
      }
      throw new InternalServerErrorException(error)
    }
  }
}
