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
