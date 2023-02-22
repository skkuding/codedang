import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException
} from '@nestjs/common'
import { InvalidCursorValueException } from '../exception/controller.exception'

@Injectable()
export class CursorValidationPipe implements PipeTransform {
  transform(value: string) {
    // validation for default values
    if (value == null) {
      return 0
    } else {
      // implements parseIntPipe
      const cursor = parseInt(value, 10)
      if (isNaN(cursor)) {
        throw new BadRequestException('Cursor value must be number')
      }
      // validation for negative values
      if (cursor <= 0) {
        throw new InvalidCursorValueException(cursor)
      }

      return cursor
    }
  }
}
