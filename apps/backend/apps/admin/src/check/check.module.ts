import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { CheckResolver } from './check.resolver'
import { CheckService } from './check.service'

@Module({
  imports: [RolesModule],
  providers: [CheckService, CheckResolver]
})
export class CheckModule {}
