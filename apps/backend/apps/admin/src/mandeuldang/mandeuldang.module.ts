import { Module } from '@nestjs/common'
import { AMQPModule } from '@libs/amqp'
import { RolesModule } from '@libs/auth'
import { MandeuldangPublicationService } from './mandeuldang-pub.service'
import { MandeuldangSubscriptionService } from './mandeuldang-sub.service'
import { MandeuldangResolver } from './mandeuldang.resolver'
import { MandeuldangService } from './mandeuldang.service'
import { FileService } from './file/file.service'

@Module({
  imports: [RolesModule, AMQPModule],
  providers: [
    MandeuldangResolver,
    MandeuldangService,
    FileService,
    MandeuldangPublicationService,
    MandeuldangSubscriptionService
  ]
})
export class MandeuldangModule {}
