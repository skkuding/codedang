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
  DefaultValuePipe,
  Headers,
  ParseBoolPipe
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthNotNeededIfOpenSpace, AuthenticatedRequest } from '@libs/auth'
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
import { CreateSubmissionDto } from './class/create-submission.dto'
import { SubmissionService } from './submission.service'

@Controller('submission')
export class SubmissionController {
  private readonly logger = new Logger(SubmissionController.name)

  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Headers('x-forwarded-for') userIp: string,
    @Body() submissionDto: CreateSubmissionDto,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('contestId', IDValidationPipe) contestId: number | null,
    @Query('workbookId', IDValidationPipe) workbookId: number | null,
    @Query('isTest', ParseBoolPipe) isTest: boolean
  ) {
    try {
      if (!contestId && !workbookId) {
        return await this.submissionService.submitToProblem(
          submissionDto,
          userIp,
          req.user.id,
          problemId,
          groupId,
          isTest || false
        )
      } else if (contestId) {
        return await this.submissionService.submitToContest(
          submissionDto,
          userIp,
          req.user.id,
          problemId,
          contestId,
          groupId,
          isTest || false
        )
      } else if (workbookId) {
        return await this.submissionService.submitToWorkbook(
          submissionDto,
          userIp,
          req.user.id,
          problemId,
          workbookId,
          groupId,
          isTest || false
        )
      }
    } catch (error) {
      if (error instanceof ConflictFoundException) {
        throw error.convert2HTTPException()
      }
      if (
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.name == 'NotFoundError') ||
        error instanceof EntityNotExistException
      ) {
        throw new NotFoundException(error.message)
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
  @AuthNotNeededIfOpenSpace()
  async getSubmissions(
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    try {
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
      return await this.submissionService.getSubmission(
        id,
        problemId,
        req.user.id,
        req.user.role,
        groupId,
        contestId
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

@Controller('contest/:contestId/submission')
export class ContestSubmissionController {
  private readonly logger = new Logger(ContestSubmissionController.name)

  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  async getSubmissions(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', IDValidationPipe) contestId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      return await this.submissionService.getContestSubmissions({
        cursor,
        take,
        problemId,
        contestId,
        userId: req.user.id,
        groupId
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
