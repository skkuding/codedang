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
  // FIXME: Contest 조회 시 로그인을 하지 않은 사용자도 조회할 수 있는지 확인 필요
  // 그래서 일단은 조회를 할 수 있게 COMMENTED OUT 처리함
  // @AuthNotNeededIfOpenSpace()
  async getContest(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    try {
      return await this.contestService.getContest(id, groupId, req.user?.id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException(error.message)
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
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException(error.message)
    }
  }
}
