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
  ForbiddenException
} from '@nestjs/common'
import { type AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import {
  ActionNotAllowedException,
  EntityNotExistException
} from 'src/common/exception/business.exception'
import { GroupMemberGuard } from 'src/group/guard/group-member.guard'
import { ContestService } from './contest.service'
import { type Contest } from '@prisma/client'
import { AuthNotNeeded } from 'src/common/decorator/auth-ignore.decorator'
import { RolesGuard } from 'src/user/guard/roles.guard'

@Controller('contest')
@AuthNotNeeded()
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getContests(@Req() req: AuthenticatedRequest): Promise<{
    registeredOngoing?: Partial<Contest>[]
    registeredUpcoming?: Partial<Contest>[]
    ongoing: Partial<Contest>[]
    upcoming: Partial<Contest>[]
    finished: Partial<Contest>[]
  }> {
    return await this.contestService.getContestsByGroupId(req.user?.id)
  }

  @Get(':contestId')
  async getContest(
    @Param('contestId', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      return await this.contestService.getContest(contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/contest')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getContests(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<{
    registeredOngoing?: Partial<Contest>[]
    registeredUpcoming?: Partial<Contest>[]
    ongoing: Partial<Contest>[]
    upcoming: Partial<Contest>[]
    finished: Partial<Contest>[]
  }> {
    return await this.contestService.getContestsByGroupId(req.user.id, groupId)
  }

  @Get(':id')
  async getContest(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      return await this.contestService.getContest(contestId, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
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
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ActionNotAllowedException) {
        throw new ForbiddenException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
