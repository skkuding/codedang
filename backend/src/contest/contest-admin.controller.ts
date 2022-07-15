import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  UseGuards
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { ContestService } from './contest.service'

@Controller('contest/admin')
export class ContestAdminController {
  constructor(private readonly contestService: ContestService) {}

  /* group admin page */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAdminContests(@Req() req: AuthenticatedRequest) {
    try {
      const contests = await this.contestService.getAdminContests(req.user.id)
      return contests
    } catch (error) {
      throw new ForbiddenException(error.message)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('ongoing')
  async getAdminOngoingContests(@Req() req: AuthenticatedRequest) {
    try {
      const contests = await this.contestService.getAdminOngoingContests(
        req.user.id
      )
      return contests
    } catch (error) {
      throw new ForbiddenException(error.message)
    }
  }

  /*
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAdminContestById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      const contests = await this.contestService.getAdminContestById(
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
  */
}
