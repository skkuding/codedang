import { Module } from '@nestjs/common'
import { PrismaModule } from '@libs/prisma'
import {
  AdminInternalController,
  InternalController
} from './internal.controller'

@Module({
  imports: [PrismaModule],
  controllers: [InternalController]
})
export class InternalModule {}

@Module({
  imports: [PrismaModule],
  controllers: [AdminInternalController]
})
export class AdminInternalModule {}
