import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { CollaboratorResolver } from './collaborator/collaborator.resolver'
import { CollaboratorService } from './collaborator/collaborator.service'
import { PolygonResolver } from './polygon.resolver'
import { PolygonService } from './polygon.service'

@Module({
  imports: [RolesModule],
  providers: [
    PolygonResolver,
    CollaboratorResolver,
    PolygonService,
    CollaboratorService
  ]
})
export class PolygonModule {}
