import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'
import { ProblemOrderList, type ProblemOrder } from '@libs/types'

@Injectable()
export class ProblemOrderPipe implements PipeTransform {
  transform(value: unknown) {
    const orderValue: ProblemOrder =
      (value as ProblemOrder) || ('id-asc' as ProblemOrder)

    if (!this.isValidProblemOrder(orderValue)) {
      throw new BadRequestException('Validation failed')
    }

    return orderValue
  }

  private isValidProblemOrder(value: ProblemOrder) {
    return (ProblemOrderList as ProblemOrder[]).includes(value)
  }
}
