import { BadRequestException } from '@nestjs/common'

export class ControllerException extends Error {
  name: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

/** Throw when a cursor has not positive value */
export class InvalidCursorValueException extends BadRequestException {
  constructor(message) {
    super(
      `Invalid cursor value: ${message}, cursor value must be a positive value`
    )
  }
}
