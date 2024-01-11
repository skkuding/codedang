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
import { GroupIdValidationPipe } from 'libs/pipe/src/group-id-validation.pipe'
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
@UseGuards(GroupMemberGuard)
export class ContestController {
  private readonly logger = new Logger(ContestController.name)

  constructor(private readonly contestService: ContestService) {}

  @Get()
  @AuthNotNeeded()
  async getContests(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIdValidationPipe) groupId: number | null
  ) {
    try {
      return await this.contestService.getContestsByGroupId(
        req.user ? req.user.id : undefined,
        groupId ? groupId : undefined
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
      return await this.contestService.getContestsByGroupId(req.user?.id)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('finished')
  @AuthNotNeeded()
  async getFinishedContests(
    @Query('groupId', GroupIdValidationPipe) groupId: number | null,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.contestService.getFinishedContestsByGroupId(
        cursor,
        take,
        groupId ? groupId : undefined
      )
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  @AuthNotNeeded()
  async getContest(
    @Query('groupId', GroupIdValidationPipe) groupId: number | null,
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      return await this.contestService.getContest(
        id,
        groupId ? groupId : undefined
      )
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
    @Query('groupId', GroupIdValidationPipe) groupId: number | null,
    @Param('id', ParseIntPipe) contestId: number
  ) {
    try {
      await this.contestService.createContestRecord(
        contestId,
        req.user.id,
        groupId ? groupId : undefined
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
