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
  DefaultValuePipe,
  Delete,
  ForbiddenException
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthNotNeededIfOpenSpace, AuthenticatedRequest } from '@libs/auth'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { ContestService } from './contest.service'

@Controller('contest')
export class ContestController {
  private readonly logger = new Logger(ContestController.name)

  constructor(private readonly contestService: ContestService) {}

  @Get()
  @AuthNotNeededIfOpenSpace()
  async getContests(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      return await this.contestService.getContestsByGroupId(
        req.user?.id,
        groupId
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

  @Get('auth')
  async authGetContests(@Req() req: AuthenticatedRequest) {
    try {
      return await this.contestService.getContestsByGroupId(req.user.id)
    } catch (error) {
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
    take: number
  ) {
    try {
      return await this.contestService.getFinishedContestsByGroupId(
        cursor,
        take,
        groupId
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
      return await this.contestService.createContestRecord(
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

  // unregister only for upcoming contest
  @Delete(':id/participation')
  async deleteContestRecord(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', new RequiredIntPipe('id')) contestId: number
  ) {
    try {
      return await this.contestService.deleteContestRecord(
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
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException(error.message)
    }
  }
}
