import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { AssignmentController } from './assignment.controller'
import { AssignmentService } from './assignment.service'

@Module({
  imports: [RolesModule],
  controllers: [AssignmentController],
  providers: [
    AssignmentService,
    { provide: APP_GUARD, useClass: GroupMemberGuard }
  ],
  exports: [AssignmentService]
})
export class AssignmentModule {}
