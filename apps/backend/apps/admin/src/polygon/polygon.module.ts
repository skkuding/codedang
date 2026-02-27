import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { PolygonResolver } from './polygon.resolver'
import { PolygonService } from './polygon.service'

@Module({
  imports: [RolesModule],
  providers: [PolygonResolver, PolygonService]
})
export class PolygonModule {}
