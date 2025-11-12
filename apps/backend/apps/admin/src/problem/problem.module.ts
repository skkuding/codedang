import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RolesModule } from '@libs/auth'
import { StorageModule } from '@libs/storage'
import { ProblemController } from './controllers/problem.controller'
import {
  FileResolver,
  ProblemTagResolver,
  TagResolver,
  TestcaseResolver
} from './resolvers'
import { ProblemResolver } from './resolvers/problem.resolver'
import { IntScoreScalar } from './scalar/int-score.scalar'
import {
  FileService,
  ProblemService,
  TagService,
  TestcaseService
} from './services'

@Module({
  imports: [StorageModule, ConfigModule, RolesModule],
  controllers: [ProblemController],
  providers: [
    ProblemResolver,
    ProblemTagResolver,
    TagResolver,
    TestcaseResolver,
    FileResolver,
    IntScoreScalar,
    ProblemService,
    TestcaseService,
    FileService,
    TagService
  ],
  exports: [IntScoreScalar, ProblemService]
})
export class ProblemModule {}
