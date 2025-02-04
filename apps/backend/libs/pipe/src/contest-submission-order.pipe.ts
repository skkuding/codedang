import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'
import { SubmissionOrder } from '@admin/submission/enum/submission-order.enum'

@Injectable()
export class SubmissionOrderPipe implements PipeTransform {
  transform(value: unknown) {
    if (!value) {
      return null
    } else if (
      !Object.values(SubmissionOrder).includes(value as SubmissionOrder)
    ) {
      throw new BadRequestException('Submission-order validation failed')
    }
    return value
  }
}
