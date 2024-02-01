import { HttpStatus } from '@nestjs/common'
import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError, type GraphQLErrorExtensions } from 'graphql'

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

export class BadUserInputGraphQLException extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.badUserInput,
        ...customExtensions
      }
    })
  }
}

export class InternalServerGraphQLException extends GraphQLError {
  constructor(
    message = 'internal server error',
    customExtensions?: GraphQLErrorExtensions
  ) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.internalServerError,
        ...customExtensions
      }
    })
  }
}

export class UnauthorizedGraphQLException extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.unauthenticated,
        ...customExtensions
      }
    })
  }
}

export class ForbiddenGraphQLException extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.forbidden,
        ...customExtensions
      }
    })
  }
}

export class NotFoundGraphQLException extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.notFound,
        ...customExtensions
      }
    })
  }
}

export class ConflictGraphQLException extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.conflict,
        ...customExtensions
      }
    })
  }
}

export class UnprocessableGraphQLException extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.unprocessable,
        ...customExtensions
      }
    })
  }
}
