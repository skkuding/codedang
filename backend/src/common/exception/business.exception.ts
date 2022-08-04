export class BusinessException extends Error {
  name: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

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

export class UnprocessableDataException extends BusinessException {}

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

export class ActionNotAllowedException extends BusinessException {
  constructor(action, entity) {
    super(`${action} is not allowed to this ${entity}`)
  }
}
