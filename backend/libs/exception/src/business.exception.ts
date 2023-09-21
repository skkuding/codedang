export class BusinessException extends Error {
  name: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

/** [401] Throw when a user cannot be identified with given credential. */
export class UnidentifiedException extends BusinessException {
  constructor(credential) {
    super(`Incorrect ${credential}`)
  }
}

/** [401] Throw when JWT token is invalid. */
export class InvalidJwtTokenException extends BusinessException {
  constructor(message) {
    super(`Invalid token: ${message}`)
  }
}

/** [404] Throw when requested entity is not found. */
export class EntityNotExistException extends BusinessException {
  constructor(entity) {
    super(`${entity} does not exist`)
  }
}

/** [409] Throw when the request has a conflict with relevant entities.
 * e.g., participation is not allowed to ended contest.
 */
export class ConflictFoundException extends BusinessException {}

/** [409] Throw when the request has a conflict with relevant entities.
 * e.g., participation is not allowed to ended contest.
 */
export class DuplicateFoundException extends ConflictFoundException {
  constructor(entity) {
    super(`${entity} is already in use`)
  }
}

/** [422] Throw when data is invalid or cannot be processed. */
export class UnprocessableDataException extends BusinessException {}

/** [422] Throw when file data is invalid or cannot be processed. */
export class UnprocessableFileDataException extends UnprocessableDataException {
  constructor(message, fileName, rowNumber) {
    super(`${message} @${fileName}:${rowNumber}`)
  }
}

/** [403] Throw when request cannot be carried due to lack of permission. */
export class ForbiddenAccessException extends BusinessException {}

export class MessageFormatError extends BusinessException {
  constructor(error) {
    super(`Invalid message format: ${JSON.stringify(error)}`)
  }
}
