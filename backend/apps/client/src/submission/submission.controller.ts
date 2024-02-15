import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  Query,
  DefaultValuePipe
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthenticatedRequest } from '@libs/auth'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
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
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('contestId', IDValidationPipe) contestId: number | null,
    @Query('workbookId', IDValidationPipe) workbookId: number | null
  ) {
    try {
      if (!contestId && !workbookId) {
        return await this.submissionService.submitToProblem(
          submissionDto,
          req.user.id,
          problemId,
          groupId
        )
      } else if (contestId) {
        return await this.submissionService.submitToContest(
          submissionDto,
          req.user.id,
          problemId,
          contestId,
          groupId
        )
      } else if (workbookId) {
        return await this.submissionService.submitToWorkbook(
          submissionDto,
          req.user.id,
          problemId,
          workbookId,
          groupId
        )
      }
    } catch (error) {
      if (
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.name == 'NotFoundError') ||
        error instanceof EntityNotExistException
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ConflictFoundException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('delay-cause')
  async checkDelay() {
    return await this.submissionService.checkDelay()
  }

  @Get()
  async getSubmissions(
    @Req() req: AuthenticatedRequest,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('contestId', IDValidationPipe) contestId: number | null
  ) {
    try {
      if (contestId) {
        return await this.submissionService.getContestSubmissions({
          cursor,
          take,
          problemId,
          contestId,
          userId: req.user.id,
          groupId
        })
      }
      return await this.submissionService.getSubmissions({
        cursor,
        take,
        problemId,
        groupId
      })
    } catch (error) {
      if (
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.name == 'NotFoundError') ||
        error instanceof EntityNotExistException
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('contestId', IDValidationPipe) contestId: number | null,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    try {
      if (contestId) {
        return await this.submissionService.getContestSubmission(
          id,
          problemId,
          contestId,
          req.user.id,
          groupId
        )
      }
      return await this.submissionService.getSubmission(
        id,
        problemId,
        req.user.id,
        groupId
      )
    } catch (error) {
      if (
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.name == 'NotFoundError') ||
        error instanceof EntityNotExistException
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
