import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { StudyRoomService } from './study-room.service'
import { StudyController } from './study.controller'
import { StudyGateway } from './study.gateway'
import { StudyService } from './study.service'

@Module({
  controllers: [StudyController],
  providers: [StudyService, StudyGateway, StudyRoomService],
  imports: [RolesModule]
})
export class StudyModule {}
