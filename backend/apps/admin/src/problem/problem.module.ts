import { Module } from '@nestjs/common'
import { ProblemResolver } from './problem.resolver'
import { ProblemService } from './problem.service'

@Module({
  providers: [ProblemResolver, ProblemService]
})
export class ProblemModule {}
