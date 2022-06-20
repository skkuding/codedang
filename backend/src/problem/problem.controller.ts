import { Controller, Inject } from '@nestjs/common'
import { ProblemService } from './problem.service'

@Controller('problem')
export class ProblemController {
  constructor(
    @Inject('problem') private readonly problemService: ProblemService
  ) {}
}
