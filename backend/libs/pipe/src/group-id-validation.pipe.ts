import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'

@Injectable()
export class GroupIdValidationPipe implements PipeTransform {
  transform(value: unknown) {
    if (value == null) {
      return null
    } else if (typeof value === 'string') {
      const groupId = parseInt(value)
      if (groupId >= 0) {
        return groupId
      }
    }
    throw new BadRequestException('Group Id must be a positive number')
  }
}
