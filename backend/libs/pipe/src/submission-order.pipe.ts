import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'
import { SubmissionOrder } from '@client/submission/enum/submission-order.enum'

@Injectable()
export class SubmissionOrderPipe implements PipeTransform {
  transform(value: unknown) {
    if (!value) {
      return SubmissionOrder.idASC
    } else if (
      !Object.values(SubmissionOrder).includes(value as SubmissionOrder)
    ) {
      throw new BadRequestException('submission-order validation failed')
    }
    return value
  }
}
