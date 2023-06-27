import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'
import { InvalidCursorValueException } from '../exception/controller.exception'

@Injectable()
export class CursorValidationPipe implements PipeTransform {
  transform(value: string) {
    if (value == null) {
      return 0
    } else {
      const cursor = parseInt(value, 10)
      if (isNaN(cursor)) {
        throw new BadRequestException('Cursor value must be number')
      }

      if (cursor <= 0) {
        throw new InvalidCursorValueException(cursor)
      }

      return cursor
    }
  }
}
