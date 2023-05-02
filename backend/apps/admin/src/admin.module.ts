import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { UserModule } from './user/user.module'
import { AdminModule } from './admin/admin.module'
import { ProblemModule } from './problem/problem.module'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true
    }),
    UserModule,
    AdminModule,
    ProblemModule
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
