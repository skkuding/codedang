import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RolesModule } from '@libs/auth'
import { CheckPublicationService } from './check-pub.service'
import { CheckSubscriptionService } from './check-sub.service'
import { CheckController } from './check.controller'
import { CheckService } from './check.service'

@Module({
  imports: [ConfigModule.forRoot(), HttpModule, RolesModule],
  providers: [CheckService, CheckPublicationService, CheckSubscriptionService],
  controllers: [CheckController]
})
export class CheckModule {}
