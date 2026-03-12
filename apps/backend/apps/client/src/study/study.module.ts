import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { StudyController } from './study.controller'
import { StudyService } from './study.service'

@Module({
  imports: [RolesModule],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService]
})
export class StudyModule {}
