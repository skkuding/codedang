import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { GraphQLModule } from '@nestjs/graphql'
import {
  JwtAuthModule,
  JwtAuthGuard,
  RolesModule,
  GroupLeaderGuard
} from '@libs/auth'
import { PrismaModule } from '@libs/prisma'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { ContestProblemModule } from './contest-problem/contest-problem.module'
import { GroupModule } from './group/group.module'
import { ProblemModule } from './problem/problem.module'
import { StorageModule } from './storage/storage.module'
import { UserModule } from './user/user.module'
import { WorkbookProblemModule } from './workbook-problem/workbook-problem.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true
    }),
    JwtAuthModule,
    RolesModule,
    PrismaModule,
    ProblemModule,
    StorageModule,
    GroupModule,
    UserModule,
    WorkbookProblemModule,
    ContestProblemModule
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: GroupLeaderGuard }
  ]
})
export class AdminModule {}
