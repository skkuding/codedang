import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ContestController } from './contest.controller'
import { ContestService } from './contest.service'

@Module({
  imports: [PrismaModule],
  controllers: [ContestController],
  providers: [ContestService]
})
export class ContestModule {}
