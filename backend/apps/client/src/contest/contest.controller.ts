import {
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Req,
  Get,
  Query,
  Logger,
  ConflictException,
  DefaultValuePipe
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthNotNeededIfOpenSpace, AuthenticatedRequest } from '@libs/auth'
import {
  ConflictFoundException,
  EntityNotExistException
} from '@libs/exception'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { ContestService } from './contest.service'

@Controller('contest')
export class ContestController {
  private readonly logger = new Logger(ContestController.name)

  constructor(private readonly contestService: ContestService) {}

  @Get('ongoing-upcoming')
  @AuthNotNeededIfOpenSpace()
  async getOngoingUpcomingContests(
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      return await this.contestService.getContestsByGroupId(groupId)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('ongoing-upcoming-with-registered')
  async getOngoingUpcomingContestsWithRegistered(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Req() req: AuthenticatedRequest
  ) {
    try {
      return await this.contestService.getContestsByGroupId(
        groupId,
        req.user.id
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('finished')
  @AuthNotNeededIfOpenSpace()
  async getFinishedContests(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('search') search?: string
  ) {
    try {
      return await this.contestService.getFinishedContestsByGroupId(
        cursor,
        take,
        groupId,
        search
      )
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('registered-finished')
  async getRegisteredFinishedContests(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string
  ) {
    try {
      return await this.contestService.getRegisteredFinishedContests(
        cursor,
        take,
        groupId,
        req.user.id,
        search
      )
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('registered-ongoing-upcoming')
  async getRegisteredOngoingUpcomingContests(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string
  ) {
    try {
      return await this.contestService.getRegisteredOngoingUpcomingContests(
        groupId,
        req.user.id,
        search
      )
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  @AuthNotNeededIfOpenSpace()
  async getContest(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    try {
      return await this.contestService.getContest(id, groupId)
    } catch (error) {
      if (
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.name === 'NotFoundError') ||
        error instanceof EntityNotExistException
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Post(':id/participation')
  async createContestRecord(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', new RequiredIntPipe('id')) contestId: number
  ) {
    try {
      await this.contestService.createContestRecord(
        contestId,
        req.user?.id,
        groupId
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException(error.message)
    }
  }
}
