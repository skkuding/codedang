import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { Contest } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { GroupMemberGuard } from 'src/group/guard/group-member.guard'
import { ContestService } from './contest.service'

@Controller('group/:group_id/contest')
@UseGuards(JwtAuthGuard, GroupMemberGuard)
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  /* public */
  @Get('ongoing')
  async getOngoingContests(): Promise<Partial<Contest>[]> {
    return await this.contestService.getOngoingContests()
  }

  @Get('upcoming')
  async getUpcomingContests(): Promise<Partial<Contest>[]> {
    return await this.contestService.getUpcomingContests()
  }

  @Get('finished')
  async getFinishedContests(): Promise<Partial<Contest>[]> {
    return await this.contestService.getFinishedContests()
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getContestById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      const contests = await this.contestService.getContestById(
        req.user.id,
        contestId
      )
      return contests
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new UnauthorizedException(error.message)
    }
  }
}

@Controller('contest/group')
export class ContestGroupController {
  constructor(private readonly contestService: ContestService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getContestById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      const contests = await this.contestService.getContestById(
        req.user.id,
        contestId
      )
      return contests
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new ForbiddenException(error.message)
    }
  }

  // Todo: issue #90
  @UseGuards(JwtAuthGuard)
  @Post(':id/participation')
  async createContestRecord(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number,
    @Param('group_id', ParseIntPipe) groupId: number
  ): Promise<null | Error> {
    try {
      this.contestService.createContestRecord(req.user.id, contestId, groupId)
      return
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new ForbiddenException(error.message)
    }
  }

  @UseGuards(GroupMemberGuard)
  @Get()
  async getContestsByGroupId(
    @Req() req: AuthenticatedRequest,
    @Param('group_id', ParseIntPipe) groupId: number
  ) {
    try {
      const contests = await this.contestService.getContestsByGroupId(
        req.user.id,
        groupId
      )
      return contests
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new ForbiddenException(error.message)
    }
  }
}
