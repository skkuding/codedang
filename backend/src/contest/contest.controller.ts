import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Req,
  UseGuards
} from '@nestjs/common'
import { Contest, Role } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { Public } from 'src/common/decorator/public.decorator'
import { Roles } from 'src/common/decorator/roles.decorator'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { GroupMemberGuard } from 'src/group/guard/group-member.guard'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { ContestService } from './contest.service'

@Controller('contest')
@Public()
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

@Controller('group/:group_id/contest')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getContests(
    @Param('group_id', ParseIntPipe) groupId: number
  ): Promise<Partial<Contest>[]> {
    return await this.contestService.getContestsByGroupId(groupId)
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
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableDataException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
