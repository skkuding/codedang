import { HttpStatus } from '@nestjs/common'
import type { GraphQLFormattedError } from 'graphql/error/GraphQLError'
import { GqlErrorCodeMapTable } from './graphql-error.exception'

export const apolloErrorFormatter = (
  formattedError: GraphQLFormattedError
): GraphQLFormattedError => {
  if (formattedError.extensions?.originalError) {
    const httpStatusCode =
      (formattedError.extensions?.originalError as { statusCode: number })
        .statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR
    formattedError.extensions['code'] = GqlErrorCodeMapTable[httpStatusCode]
    delete formattedError.extensions.originalError
  }
  return formattedError
}
