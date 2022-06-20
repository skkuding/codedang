import { Module } from '@nestjs/common'
import { ProblemController } from './problem.controller'
import { ProblemService } from './problem.service'

@Module({
  controllers: [ProblemController],
  providers: [ProblemService]
})
export class ProblemModule {}
