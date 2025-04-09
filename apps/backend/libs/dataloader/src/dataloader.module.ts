import { Module } from '@nestjs/common'
import { PrismaModule } from '@libs/prisma'
import { DataLoaderService } from './dataloader.service'
import { UserLoader } from './loaders/user.loader'

@Module({
  imports: [PrismaModule],
  providers: [DataLoaderService, UserLoader],
  exports: [DataLoaderService]
})
export class DataLoaderModule {}
