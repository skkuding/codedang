import { Resolver } from '@nestjs/graphql'
import { UseDisableAdminGuard } from '@libs/auth'
import { PolygonProblem } from '@admin/@generated'
import { PolygonService } from './polygon.service'

@Resolver(() => PolygonProblem)
@UseDisableAdminGuard()
export class PolygonResolver {
  constructor(private readonly polygonService: PolygonService) {}
}
