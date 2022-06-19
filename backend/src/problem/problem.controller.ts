import { Controller } from '@nestjs/common'
import { ProblemService } from './problem.service'

@Controller('problem')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}
}
