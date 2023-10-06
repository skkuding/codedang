import { BadRequestException } from '@nestjs/common'

/** Throw when a cursor has not positive value */
export class InvalidCursorValueException extends BadRequestException {
  constructor(message) {
    super(
      `Invalid cursor value: ${message}, cursor value must be a positive value`
    )
  }
}
