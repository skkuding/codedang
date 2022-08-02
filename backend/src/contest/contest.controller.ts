import {
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Req,
  UseGuards
} from '@nestjs/common'
import { Contest } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import {
  EntityNotExistException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { GroupMemberGuard } from 'src/group/guard/group-member.guard'
import { ContestService } from './contest.service'

@Controller('group/:group_id/contest')
@UseGuards(JwtAuthGuard)
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getContests() {
    return await this.contestService.getContests()
  }

  @Get(':id')
  async getContestById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      return await this.contestService.getContestById(req.user.id, contestId)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      if (err instanceof InvalidUserException) {
        throw new ForbiddenException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @UseGuards(GroupMemberGuard)
  async getContestsByGroupId(@Param('group_id', ParseIntPipe) groupId: number) {
    return await this.contestService.getContestsByGroupId(groupId)
  }
}
