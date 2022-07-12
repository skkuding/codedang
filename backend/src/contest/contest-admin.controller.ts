import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common'
import { Contest } from '@prisma/client'
import { ContestService } from './contest.service'

@Controller('contest/admin')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  /* group admin page */
  @Get()
  async getAdminList(@Req() req) {
    const userId = req.body.user.id
    return await this.contestService.getAdminList(userId)
  }

  @Get('ongoing')
  async getAdminOngoingList(@Req() req) {
    const userId = req.body.user.id
    return await this.contestService.getAdminOngoingList(userId)
  }

  @Get(':id')
  // Todo: add guard
  async getAdminDetailById(
    @Req() req,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    const userId = req.body.user.id
    return await this.contestService.getAdminDetailById(userId, contestId)
  }
}
