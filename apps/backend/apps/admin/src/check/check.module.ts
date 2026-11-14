import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AMQPModule } from '@libs/amqp'
import { RolesModule } from '@libs/auth'
import { StorageModule } from '@libs/storage'
import { CheckAdminResolver } from './check-admin.resolver'
import { CheckPublicationService } from './check-pub.service'
import { CheckSubscriptionService } from './check-sub.service'
import { CheckResolver } from './check.resolver'
import { CheckService } from './check.service'
import { FileService } from './file.service'

@Module({
  imports: [ConfigModule.forRoot(), AMQPModule, RolesModule, StorageModule],
  providers: [
    CheckService,
    CheckPublicationService,
    CheckSubscriptionService,
    CheckResolver,
    CheckAdminResolver,
    FileService
  ]
})
export class CheckModule {}
