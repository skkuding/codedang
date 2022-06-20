import { Controller, Inject } from '@nestjs/common'
import { ContestService } from './contest.service'

@Controller('contest')
export class ContestController {
  constructor(
    @Inject('contest') private readonly contestService: ContestService
  ) {}
}
