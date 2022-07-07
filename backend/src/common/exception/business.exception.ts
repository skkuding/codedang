export class BusinessException extends Error {
  name: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class PasswordNotMatchException extends BusinessException {}
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
