import { Module } from '@nestjs/common'
import { AMQPModule } from '@libs/amqp'
import { RolesModule } from '@libs/auth'
import { FileService } from './file/file.service'
import { MandeuldangPublicationService } from './mandeuldang-pub.service'
import { MandeuldangSubscriptionService } from './mandeuldang-sub.service'
import { MandeuldangResolver } from './mandeuldang.resolver'
import { MandeuldangService } from './mandeuldang.service'
import { MandeuldangProblemModule } from './problem/problem.module'

@Module({
  imports: [RolesModule, AMQPModule, MandeuldangProblemModule],
  providers: [
    MandeuldangResolver,
    MandeuldangService,
    FileService,
    MandeuldangPublicationService,
    MandeuldangSubscriptionService
  ]
})
export class MandeuldangModule {}
