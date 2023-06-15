import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { UserModule } from './user/user.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from '@admin/auth/guard/jwt-auth.guard'
import { RolesGuard } from './user/guard/roles.guard'
import { PrismaModule } from '@libs/prisma'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@admin/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true
    }),
    UserModule,
    PrismaModule,
    AuthModule
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard }
  ]
})
export class AdminModule {}
