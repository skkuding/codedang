import {
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Get,
  UseGuards,
  Query,
  Logger,
  ConflictException
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  AuthenticatedRequest,
  AuthNotNeeded,
  GroupMemberGuard
} from '@libs/auth'
import {
  ConflictFoundException,
  EntityNotExistException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { ContestService } from './contest.service'

@Controller('contest')
export class ContestController {
  private readonly logger = new Logger(ContestController.name)

  constructor(private readonly contestService: ContestService) {}

  @Get()
  @AuthNotNeeded()
  async getContests() {
    try {
      return await this.contestService.getContestsByGroupId()
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('auth')
  async authGetContests(@Req() req: AuthenticatedRequest) {
    try {
      return await this.contestService.getContestsByGroupId(req.user?.id)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('finished')
  @AuthNotNeeded()
  async getFinishedContests(
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.contestService.getFinishedContestsByGroupId(
        cursor,
        take
      )
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  @AuthNotNeeded()
  async getContest(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.contestService.getContest(id)
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

  @Post(':id/participation')
  async createContestRecord(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number
  ) {
    try {
      await this.contestService.createContestRecord(contestId, req.user.id)
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

@Controller('group/:groupId/contest')
@UseGuards(GroupMemberGuard)
export class GroupContestController {
  private readonly logger = new Logger(GroupContestController.name)

  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getContests(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ) {
    try {
      return await this.contestService.getContestsByGroupId(
        req.user.id,
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

  @Get('finished')
  async getFinishedContests(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', ParseIntPipe) take: number
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
  async getContest(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      return await this.contestService.getContest(id, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Post(':id/participation')
  async createContestRecord(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id', ParseIntPipe) contestId: number
  ) {
    try {
      await this.contestService.createContestRecord(
        contestId,
        req.user.id,
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
      throw new InternalServerErrorException()
    }
  }
}
