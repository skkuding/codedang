import { Module } from '@nestjs/common'
import { AMQPModule } from '@libs/amqp'
import { RolesModule } from '@libs/auth'
import { FileService } from './file/file.service'
import { PolygonPublicationService } from './polygon-pub.service'
import { PolygonSubscriptionService } from './polygon-sub.service'
import { PolygonResolver } from './polygon.resolver'
import { PolygonService } from './polygon.service'

@Module({
  imports: [RolesModule, AMQPModule],
  providers: [
    PolygonResolver,
    PolygonService,
    FileService,
    PolygonPublicationService,
    PolygonSubscriptionService
  ]
})
export class PolygonModule {}
