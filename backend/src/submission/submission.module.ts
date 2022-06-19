import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { SubmissionController } from './submission.controller'
import { SubmissionService } from './submission.service'

@Module({
  imports: [PrismaModule],
  controllers: [SubmissionController],
  providers: [SubmissionService]
})
export class SubmissionModule {}
