import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { ProblemService } from './problem.service'
import { Problem } from '@admin/@generated/problem/problem.model'
import { AuthenticatedRequest } from '@client/auth/interface/authenticated-request.interface'
import { FileUploadInput } from './model/file-upload.input'
import {
  BadRequestException,
  InternalServerErrorException,
  ParseIntPipe
} from '@nestjs/common'
import { type Prisma } from '@prisma/client'
import { ActionNotAllowedException } from '@client/common/exception/business.exception'
import { UploadedProblems } from './model/file-upload.output'

@Resolver(() => Problem)
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Mutation(() => UploadedProblems)
  async uploadProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { nullable: false }, ParseIntPipe) groupId: number,
    @Args('input') input: FileUploadInput
  ): Promise<Prisma.BatchPayload> {
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
