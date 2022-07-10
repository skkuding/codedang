import { Controller } from '@nestjs/common'
import { ContestService } from './contest.service'

@Controller()
export class ContestController {
  constructor(private readonly contestService: ContestService) {}
}
