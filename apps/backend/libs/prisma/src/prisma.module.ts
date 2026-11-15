import { Global, Module, type OnApplicationShutdown } from '@nestjs/common'
import Instrumentation from '../../instrumentation'
import { PrismaService } from './prisma.service'

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule implements OnApplicationShutdown {
  async onApplicationShutdown() {
    await Instrumentation.shutdown()
  }
}
