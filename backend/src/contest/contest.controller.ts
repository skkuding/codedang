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
import { PUBLIC_GROUP_ID } from 'src/common/constants'

@Controller('contest/auth')
export class PublicContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getContests(@Req() req: AuthenticatedRequest): Promise<{
    registeredOngoing?: Partial<Contest>[]
    registeredUpcoming?: Partial<Contest>[]
    ongoing: Partial<Contest>[]
    upcoming: Partial<Contest>[]
    finished: Partial<Contest>[]
  }> {
    return await this.contestService.getContests(req.user.id, PUBLIC_GROUP_ID)
  }

  @Get(':contestId')
  async getContest(
    @Param('contestId', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      return await this.contestService.getContestDetailById(
        PUBLIC_GROUP_ID,
        contestId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Controller('contest')
@AuthNotNeeded()
export class GuestContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getContests(@Req() req: AuthenticatedRequest): Promise<{
    ongoing: Partial<Contest>[]
    upcoming: Partial<Contest>[]
    finished: Partial<Contest>[]
  }> {
    return await this.contestService.getContests(req.user?.id, PUBLIC_GROUP_ID)
  }

  @Get(':contestId')
  async getContest(
    @Param('contestId', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      return await this.contestService.getContestDetailById(
        PUBLIC_GROUP_ID,
        contestId
      )
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
    return await this.contestService.getContests(req.user.id, groupId)
  }

  @Get(':id')
  async getContest(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      return await this.contestService.getContestDetailById(groupId, contestId)
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
      await this.contestService.createContestRecord(req.user.id, contestId)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      if (err instanceof ActionNotAllowedException) {
        throw new ForbiddenException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
