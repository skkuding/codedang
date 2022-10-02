import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true
    })
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
