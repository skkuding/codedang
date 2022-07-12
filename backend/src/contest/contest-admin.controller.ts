import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common'
import { Contest } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { ContestService } from './contest.service'

@Controller('contest/admin')
export class ContestAdminController {
  constructor(private readonly contestService: ContestService) {}

  /* group admin page */
  @Get()
  async getAdminContests(@Req() req) {
    const userId = req.body.user.id
    return await this.contestService.getAdminContests(userId)
  }

  @Get('ongoing')
  async getAdminOngoingContests(@Req() req) {
    const userId = req.body.user.id
    return await this.contestService.getAdminOngoingContests(userId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAdminContestById(
    @Req() req,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    const userId = req.body.user.id
    return await this.contestService.getAdminContestById(userId, contestId)
  }
}
