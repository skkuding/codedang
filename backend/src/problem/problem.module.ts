import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ProblemController } from './problem.controller'
import { ProblemService } from './problem.service'

@Module({
  imports: [PrismaModule],
  controllers: [ProblemController],
  providers: [ProblemService]
})
export class ProblemModule {}
