import {
  type PipeTransform,
  Injectable,
  BadRequestException
} from '@nestjs/common'

@Injectable()
export class CursorValidationPipe implements PipeTransform {
  transform(value: unknown) {
    if (value == null) {
      return null
    } else if (typeof value === 'string' || typeof value === 'number') {
      const cursor = typeof value === 'string' ? parseInt(value) : value
      if (cursor > 0) {
        return cursor
      }
    }
    throw new BadRequestException('Cursor must be a positive number')
  }
}
