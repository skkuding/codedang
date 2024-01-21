import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'

@Injectable()
export class IdValidationPipe implements PipeTransform {
  transform(value: unknown) {
    if (value === undefined) {
      return value
    } else if (typeof value === 'string') {
      const id = parseInt(value)
      if (id > 0) {
        return id
      }
    }
    throw new BadRequestException('Id must be a positive number')
  }
}
