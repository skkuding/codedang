import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { CheckPublicationService } from './check-pub.service'
import { CheckSubscriptionService } from './check-sub.service'
import { CheckResolver } from './check.resolver'
import { CheckService } from './check.service'

@Module({
  imports: [RolesModule],
  providers: [
    CheckService,
    CheckPublicationService,
    CheckSubscriptionService,
    CheckResolver
  ],
  controllers: []
})
export class CheckModule {}
