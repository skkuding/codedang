import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'

@Injectable()
export class IDValidationPipe implements PipeTransform {
  transform(value: unknown) {
    if (value == null) {
      return null
    } else if (typeof value === 'string') {
      const id = parseInt(value)
      if (id > 0) {
        return id
      }
    }
    throw new BadRequestException('ID must be a positive number')
  }
}
