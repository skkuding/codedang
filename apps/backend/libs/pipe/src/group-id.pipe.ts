import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'

@Injectable()
export class GroupIDPipe implements PipeTransform {
  transform(value: unknown) {
    if (value == null) {
      throw new BadRequestException('Group ID must not be null')
    } else if (typeof value === 'string' || typeof value === 'number') {
      const id = typeof value === 'string' ? parseInt(value) : value
      if (id > 0) {
        return id
      }
    }
    throw new BadRequestException('Group ID must be a positive number')
  }
}

@Injectable()
export class NullableGroupIDPipe implements PipeTransform {
  transform(value: unknown) {
    if (value == null) {
      return null
    } else if (typeof value === 'string' || typeof value === 'number') {
      const id = typeof value === 'string' ? parseInt(value) : value
      if (id > 0) {
        return id
      }
    }
    throw new BadRequestException('Group ID must be a positive number')
  }
}
