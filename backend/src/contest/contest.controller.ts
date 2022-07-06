import { Body, Controller, Post } from '@nestjs/common'
import { ContestService } from './contest.service'
import { CreateContestDto } from './dto/create-contest.dto'

@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  async create(@Body() contestData: CreateContestDto) {
    return await this.contestService.create(contestData)
  }
}
