import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import { InvalidCursorValueException } from '../exception/controller.exception'

@Injectable()
export class CursorValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value) {
      if (value <= 0) {
        throw new InvalidCursorValueException(value)
      }
    }

    return value
  }
}
