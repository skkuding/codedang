import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo'
import { CacheModule } from '@nestjs/cache-manager'
import { Module, type OnApplicationBootstrap } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_FILTER, HttpAdapterHost } from '@nestjs/core'
import { GraphQLModule } from '@nestjs/graphql'
import type { Server } from 'http'
import { LoggerModule } from 'nestjs-pino'
import {
  JwtAuthModule,
  JwtAuthGuard,
  RolesModule,
  GroupLeaderGuard
} from '@libs/auth'
import { CacheConfigService } from '@libs/cache'
import { AdminExceptionFilter } from '@libs/exception'
import { apolloErrorFormatter } from '@libs/exception'
import { LoggingPlugin, pinoLoggerModuleOption } from '@libs/logger'
import { PrismaModule } from '@libs/prisma'
import { NoticeModule } from '@admin/notice/notice.module'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { AnnouncementModule } from './announcement/announcement.module'
import { ContestModule } from './contest/contest.module'
import { GroupModule } from './group/group.module'
import { ProblemModule } from './problem/problem.module'
import { StorageModule } from './storage/storage.module'
import { SubmissionModule } from './submission/submission.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      introspection: true,
      formatError: apolloErrorFormatter
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService
    }),
    JwtAuthModule,
    RolesModule,
    PrismaModule,
    ContestModule,
    ProblemModule,
    StorageModule,
    GroupModule,
    UserModule,
    AnnouncementModule,
    NoticeModule,
    SubmissionModule,
    LoggerModule.forRoot(pinoLoggerModuleOption)
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: GroupLeaderGuard },
    { provide: APP_FILTER, useClass: AdminExceptionFilter },
    LoggingPlugin
  ]
})
export class AdminModule implements OnApplicationBootstrap {
  constructor(private readonly refHost: HttpAdapterHost) {}

  onApplicationBootstrap() {
    // Keep-Alive timeout of reverse proxy must be longer than of the backend
    // Set timeout of Caddy to 60s and of the backend to 61s to avoid timeout error
    // https://adamcrowder.net/posts/node-express-api-and-aws-alb-502/
    const server: Server = this.refHost.httpAdapter.getHttpServer()
    server.keepAliveTimeout = 61 * 1000
    server.headersTimeout = 62 * 1000
  }
}
