import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { StudyController } from './study.controller'
import { StudyService } from './study.service'

@Module({
  controllers: [StudyController],
  providers: [StudyService],
  imports: [RolesModule]
})
export class StudyModule {}
