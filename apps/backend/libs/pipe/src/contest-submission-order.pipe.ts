import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'
import { ContestSubmissionOrder } from '@admin/submission/enum/contest-submission-order.enum'

@Injectable()
export class ContestSubmissionOrderPipe implements PipeTransform {
  transform(value: unknown) {
    if (!value) {
      return null
    } else if (
      !Object.values(ContestSubmissionOrder).includes(
        value as ContestSubmissionOrder
      )
    ) {
      throw new BadRequestException(
        'Contest-submission-order validation failed'
      )
    }
    return value
  }
}
