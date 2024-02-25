import { Plugin } from '@nestjs/apollo'
import { Logger } from '@nestjs/common'
import type { GqlExecutionContext } from '@nestjs/graphql'
import type { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server'

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(LoggingPlugin.name)

  async requestDidStart(): Promise<
    GraphQLRequestListener<GqlExecutionContext>
  > {
    return {
      didEncounterErrors: async (requestContext) => {
        for (const error of requestContext.errors) {
          this.logger.log(error)
        }
      }
    }
  }
}
