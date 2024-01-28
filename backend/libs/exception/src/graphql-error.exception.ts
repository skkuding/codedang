import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError, type GraphQLErrorExtensions } from 'graphql'

enum GraphQLErrorCode {
  /** The GraphQL operation includes an invalid value for a field argument. */
  badUserInput = ApolloServerErrorCode.BAD_USER_INPUT,
  /** An unspecified error occurred. When Apollo Server formats an error in a response, it sets the code extension to this value if no other code is set. */
  internalServerError = ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
  /** User do not have a valid credential */
  unauthorized = 'UNAUTHORIZED',
  /** Not enough permission to conduct the operation */
  forbidden = 'FORBIDDEN',
  /** Resource not found */
  notFound = 'NOT_FOUND',
  /** User's request makes some conflicts on the server resources or policies */
  conflict = 'CONFLICT',
  /** Unable to process the contained instruction */
  unprocessable = 'UNPROCESSABLE'
}

export class BadUserInputGraphQLError extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.badUserInput,
        ...customExtensions
      }
    })
  }
}

export class InternalServerGraphQLError extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.internalServerError,
        ...customExtensions
      }
    })
  }
}

export class UnauthorizedGraphQLError extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.unauthorized,
        ...customExtensions
      }
    })
  }
}

export class ForbiddenGraphQLError extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.forbidden,
        ...customExtensions
      }
    })
  }
}

export class NotFoundGraphQLError extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.notFound,
        ...customExtensions
      }
    })
  }
}

export class ConflictGraphQLError extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.conflict,
        ...customExtensions
      }
    })
  }
}

export class UnprocessableGraphQLError extends GraphQLError {
  constructor(message: string, customExtensions?: GraphQLErrorExtensions) {
    super(message, {
      extensions: {
        code: GraphQLErrorCode.unprocessable,
        ...customExtensions
      }
    })
  }
}
