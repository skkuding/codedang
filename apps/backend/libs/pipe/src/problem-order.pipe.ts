import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'
import { ProblemOrder } from '@client/problem/enum/problem-order.enum'

@Injectable()
export class ProblemOrderPipe implements PipeTransform {
  transform(value: unknown) {
    if (!value) {
      return ProblemOrder.idASC
    } else if (!Object.values(ProblemOrder).includes(value as ProblemOrder)) {
      throw new BadRequestException('Problem-order validation failed')
    }
    return value
  }
}
