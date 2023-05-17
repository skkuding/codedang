export class BusinessException extends Error {
  name: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

/** Throw when a user cannot be found with wrong usernmae or password. */
export class InvalidUserException extends BusinessException {}
export class InvalidJwtTokenException extends BusinessException {
  constructor(message) {
    super(`Invalid token: ${message}`)
  }
}

export class EntityNotExistException extends BusinessException {
  constructor(entity) {
    super(`${entity} does not exist`)
  }
}

/** Throw when invalid action is attemped, such as joining ended contest.
 * This exception may be thrown if a trial by an user is invalid.
 */
export class ActionNotAllowedException extends BusinessException {
  constructor(action, entity) {
    super(`${action} is not allowed to this ${entity}`)
  }
}

/** Throw when data is invalid or processing logic is missing. */
export class UnprocessableDataException extends BusinessException {}

/** Throw when a user should not access due to lack of permission */
export class ForbiddenAccessException extends BusinessException {}

export class InvalidMailTransporterException extends BusinessException {}

export class InvalidPinException extends BusinessException {
  constructor(message = 'PIN not found or invalid PIN') {
    super(message)
  }
}

export class EmailTransmissionFailedException extends BusinessException {
  constructor(message = 'Email transmission failed') {
    super(message)
  }
}

export class MessageFormatError extends BusinessException {
  constructor(error) {
    super(`Invalid message format: ${JSON.stringify(error)}`)
  }
}
