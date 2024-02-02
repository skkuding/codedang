import { HttpStatus } from '@nestjs/common'
import { ApolloServerErrorCode } from '@apollo/server/errors'

enum GraphQLErrorCode {
  /** The GraphQL operation includes an invalid value for a field argument. */
  badUserInput = ApolloServerErrorCode.BAD_USER_INPUT,
  /** An unspecified error occurred. When Apollo Server formats an error in a response, it sets the code extension to this value if no other code is set. */
  internalServerError = ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
  /** An error occurred before your server could attempt to parse the given GraphQL operation. */
  badRequest = ApolloServerErrorCode.BAD_REQUEST,
  /** User do not have a valid credential */
  unauthenticated = 'UNAUTHENTICATED',
  /** Not enough permission to conduct the operation */
  forbidden = 'FORBIDDEN',
  /** Resource not found */
  notFound = 'NOT_FOUND',
  /** User's request makes some conflicts on the server resources or policies */
  conflict = 'CONFLICT',
  /** Unable to process the contained instruction */
  unprocessable = 'UNPROCESSABLE'
}

export const GqlErrorCodeMapTable: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.BAD_REQUEST]: GraphQLErrorCode.badRequest,
  [HttpStatus.UNAUTHORIZED]: GraphQLErrorCode.unauthenticated,
  [HttpStatus.FORBIDDEN]: GraphQLErrorCode.unauthenticated,
  [HttpStatus.NOT_FOUND]: GraphQLErrorCode.notFound,
  [HttpStatus.CONFLICT]: GraphQLErrorCode.conflict,
  [HttpStatus.UNPROCESSABLE_ENTITY]: GraphQLErrorCode.unprocessable
}
