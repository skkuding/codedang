import { Module } from '@nestjs/common'
import { AMQPModule } from '@libs/amqp'
import { RolesModule } from '@libs/auth'
import { FileService } from './file/file.service'
import { PolygonResolver } from './polygon.resolver'
import { PolygonService } from './polygon.service'

@Module({
  imports: [RolesModule, AMQPModule],
  providers: [PolygonResolver, PolygonService, FileService]
})
export class PolygonModule {}
