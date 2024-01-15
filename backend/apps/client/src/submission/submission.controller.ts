import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  ForbiddenException,
  Logger,
  Query
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IdValidationPipe } from 'libs/pipe/src/id-validation.pipe'
import { AuthenticatedRequest } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { SubmissionService } from './submission.service'

@Controller('submission')
export class SubmissionController {
  private readonly logger = new Logger(SubmissionController.name)

  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Body() submissionDto: CreateSubmissionDto,
    @Query('problemId', IdValidationPipe) problemId: number,
    @Query('groupId', IdValidationPipe) groupId: number | null,
    @Query('contestId', IdValidationPipe) contestId: number | null,
    @Query('workbookId', IdValidationPipe) workbookId: number | null
  ) {
    try {
      if (!contestId && !workbookId) {
        return await this.submissionService.submitToProblem(
          submissionDto,
          req.user.id,
          problemId,
          groupId ?? OPEN_SPACE_ID
        )
      } else if (contestId) {
        return await this.submissionService.submitToContest(
          submissionDto,
          req.user.id,
          problemId,
          contestId,
          groupId ?? OPEN_SPACE_ID
        )
      } else if (workbookId) {
        return await this.submissionService.submitToWorkbook(
          submissionDto,
          req.user.id,
          problemId,
          workbookId,
          groupId ?? OPEN_SPACE_ID
        )
      }
    } catch (error) {
      if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getSubmissions(
    @Req() req: AuthenticatedRequest,
    @Query('problemId', IdValidationPipe) problemId: number,
    @Query('groupId', IdValidationPipe) groupId: number | null,
    @Query('contestId', IdValidationPipe) contestId: number | null
  ) {
    try {
      if (contestId) {
        return await this.submissionService.getContestSubmissions(
          problemId,
          contestId,
          req.user.id,
          groupId ?? OPEN_SPACE_ID
        )
      }
      return await this.submissionService.getSubmissions(
        problemId,
        groupId ?? OPEN_SPACE_ID
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Query('problemId', IdValidationPipe) problemId: number,
    @Query('groupId', IdValidationPipe) groupId: number | null,
    @Query('contestId', IdValidationPipe) contestId: number | null,
    @Param('id', IdValidationPipe) id: number
  ) {
    try {
      if (contestId) {
        return await this.submissionService.getContestSubmission(
          id,
          problemId,
          contestId,
          req.user.id,
          groupId ?? OPEN_SPACE_ID
        )
      }
      return await this.submissionService.getSubmission(
        id,
        problemId,
        req.user.id,
        groupId ?? OPEN_SPACE_ID
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
