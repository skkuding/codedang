import { Module } from '@nestjs/common'
import { AMQPModule } from '@libs/amqp'
import { RolesModule } from '@libs/auth'
import { StorageModule } from '@libs/storage'
import { FileService } from './file/file.service'
import { MandeuldangPublicationService } from './mandeuldang-pub.service'
import { MandeuldangSubscriptionService } from './mandeuldang-sub.service'
import { MandeuldangResolver } from './mandeuldang.resolver'
import { MandeuldangService } from './mandeuldang.service'

@Module({
  imports: [RolesModule, AMQPModule, StorageModule],
  providers: [
    MandeuldangResolver,
    MandeuldangService,
    FileService,
    MandeuldangPublicationService,
    MandeuldangSubscriptionService
  ]
})
export class MandeuldangModule {}
