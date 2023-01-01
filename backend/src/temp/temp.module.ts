import { Module } from '@nestjs/common'
import { TempResolver } from './temp.resolver'

@Module({
  providers: [TempResolver]
})
export class TempModule {}
