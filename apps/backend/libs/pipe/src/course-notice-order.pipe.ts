import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'
import { CourseNoticeOrder } from '@client/notice/enum/course_notice-order.enum'

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
