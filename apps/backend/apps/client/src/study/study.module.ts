import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { StudyController } from './study.controller'
import { StudyGateway } from './study.gateway'
import { StudyService } from './study.service'

@Module({
  controllers: [StudyController],
  providers: [StudyService, StudyGateway],
  imports: [RolesModule]
})
export class StudyModule {}
