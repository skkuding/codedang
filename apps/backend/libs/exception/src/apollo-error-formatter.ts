import { HttpStatus } from '@nestjs/common'
import type { GraphQLFormattedError } from 'graphql/error/GraphQLError'
import { GqlErrorCodeMapTable } from './graphql-error-code'

export const apolloErrorFormatter = (
  formattedError: GraphQLFormattedError
): GraphQLFormattedError => {
  if (formattedError.extensions?.originalError) {
    const { extensions, ...restFormattedError } = formattedError
    const httpStatusCode =
      (extensions?.originalError as { statusCode: number })?.statusCode ??
      HttpStatus.INTERNAL_SERVER_ERROR
    return {
      ...restFormattedError,
      extensions: {
        code: GqlErrorCodeMapTable[httpStatusCode],
        stacktrace: extensions?.stacktrace
      }
    }
  }
  return formattedError
}
