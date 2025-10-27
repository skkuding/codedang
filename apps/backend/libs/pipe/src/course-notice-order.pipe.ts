import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'
import { CourseNoticeOrder } from '@client/group/enum/course-notice-order.enum'

@Injectable()
export class CourseNoticeOrderPipe implements PipeTransform {
  transform(value: unknown) {
    if (!value) {
      return null
    } else if (
      !Object.values(CourseNoticeOrder).includes(value as CourseNoticeOrder)
    ) {
      throw new BadRequestException('Course-Notice-order validation failed')
    }
    return value
  }
}
