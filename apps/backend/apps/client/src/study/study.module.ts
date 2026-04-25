import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { StudyRoomProcessor } from './study-room.processor'
import { STUDY_ROOM_QUEUE } from './study-room.service'
import { StudyRoomService } from './study-room.service'
import { StudyController } from './study.controller'
import { StudyGateway } from './study.gateway'
import { StudyService } from './study.service'

@Module({
  controllers: [StudyController],
  providers: [StudyService, StudyGateway, StudyRoomService, StudyRoomProcessor],
  imports: [
    RolesModule,
    BullModule.registerQueue({ name: STUDY_ROOM_QUEUE }) // 'study-room
  ]
})
export class StudyModule {}
