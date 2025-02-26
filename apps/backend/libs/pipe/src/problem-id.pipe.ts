import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'

@Injectable()
export class ProblemIDPipe implements PipeTransform {
  transform(value: unknown) {
    if (value == null) {
      throw new BadRequestException('Problem ID must be included in Query')
    } else if (typeof value === 'string' || typeof value === 'number') {
      const id = typeof value === 'string' ? parseInt(value) : value
      if (id > 0) {
        return id
      }
    }
    throw new BadRequestException('Problem ID must be a positive number')
  }
}
