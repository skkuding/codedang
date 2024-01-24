import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'
import { OPEN_SPACE_ID } from '@libs/constants'

@Injectable()
export class GroupIDPipe implements PipeTransform {
  transform(value: unknown) {
    if (value == null) {
      return OPEN_SPACE_ID
    } else if (typeof value === 'string' || typeof value === 'number') {
      const id = typeof value === 'string' ? parseInt(value) : value
      if (id > 0) {
        return id
      }
    }
    throw new BadRequestException('Group ID must be a positive number')
  }
}
