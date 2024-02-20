import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { GraphQLModule } from '@nestjs/graphql'
import { LoggerModule } from 'nestjs-pino'
import {
  JwtAuthModule,
  JwtAuthGuard,
  RolesModule,
  GroupLeaderGuard
} from '@libs/auth'
import { CacheConfigService } from '@libs/cache'
import {
  BusinessExceptionFilter,
  UnknownExceptionFilter
} from '@libs/exception'
import { apolloErrorFormatter } from '@libs/exception'
import { pinoLoggerModuleOption } from '@libs/logger'
import { PrismaModule } from '@libs/prisma'
import { NoticeModule } from '@admin/notice/notice.module'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { AnnouncementModule } from './announcement/announcement.module'
import { ContestModule } from './contest/contest.module'
import { GroupModule } from './group/group.module'
import { ProblemModule } from './problem/problem.module'
import { StorageModule } from './storage/storage.module'
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
    LoggerModule.forRoot(pinoLoggerModuleOption)
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: GroupLeaderGuard },
    { provide: APP_FILTER, useClass: UnknownExceptionFilter },
    { provide: APP_FILTER, useClass: BusinessExceptionFilter }
  ]
})
export class AdminModule {}
