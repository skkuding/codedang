import { Module } from '@nestjs/common'
import { AMQPModule } from '@libs/amqp'
import { RolesModule } from '@libs/auth'
import { MandeuldangPublicationService } from './Mandeuldang-pub.service'
import { MandeuldangSubscriptionService } from './Mandeuldang-sub.service'
import { MandeuldangResolver } from './Mandeuldang.resolver'
import { MandeuldangService } from './Mandeuldang.service'
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
