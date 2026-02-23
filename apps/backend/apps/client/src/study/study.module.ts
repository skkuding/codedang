import { Module } from '@nestjs/common'
import { StudyController } from './study.controller'
import { StudyService } from './study.service'

@Module({
  controllers: [StudyController],
  providers: [StudyService]
})
export class StudyModule {}
