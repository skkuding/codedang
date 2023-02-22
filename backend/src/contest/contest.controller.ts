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
  MethodNotAllowedException,
  Query
} from '@nestjs/common'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import {
  ActionNotAllowedException,
  EntityNotExistException
} from 'src/common/exception/business.exception'
import { GroupMemberGuard } from 'src/group/guard/group-member.guard'
import { ContestService } from './contest.service'
import { Contest } from '@prisma/client'
import { AuthNotNeeded } from 'src/common/decorator/auth-ignore.decorator'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { CursorValidationPipe } from 'src/common/pipe/cursor-validation.pipe'

@Controller('contest')
@AuthNotNeeded()
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getContests(): Promise<{
    ongoing: Partial<Contest>[]
    upcoming: Partial<Contest>[]
    finished: Partial<Contest>[]
  }> {
    return await this.contestService.getContests()
  }

  @Get(':id/modal')
  async getModalContest(
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      return await this.contestService.getModalContestById(contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/contest')
export class GroupContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  @UseGuards(RolesGuard, GroupMemberGuard)
  async getContests(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('cursor', CursorValidationPipe)
    cursor: number,
    @Query('take', ParseIntPipe) offset: number
  ): Promise<Partial<Contest>[]> {
    return await this.contestService.getContestsByGroupId(
      groupId,
      cursor,
      offset
    )
  }

  @Get(':id')
  async getContest(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      return await this.contestService.getContestById(req.user.id, contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof ActionNotAllowedException) {
        throw new MethodNotAllowedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Post(':id/participation')
  @UseGuards(RolesGuard, GroupMemberGuard)
  async createContestRecord(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<null> {
    try {
      this.contestService.createContestRecord(req.user.id, contestId)
      return
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      if (err instanceof ActionNotAllowedException) {
        throw new MethodNotAllowedException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
