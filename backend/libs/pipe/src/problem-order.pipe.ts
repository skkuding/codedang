import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'
import { ProblemOrder, ProblemOrderList } from '@libs/types'

@Injectable()
export class ProblemOrderPipe implements PipeTransform {
  transform(value: unknown) {
    const orderValue: ProblemOrder =
      (value as ProblemOrder) ?? ProblemOrder.idASC

    if (!this.isValidProblemOrder(orderValue)) {
      throw new BadRequestException('Validation failed')
    }

    return orderValue
  }

  private isValidProblemOrder(value: ProblemOrder) {
    console.log(ProblemOrderList, value)
    return (ProblemOrderList as ProblemOrder[]).includes(value)
  }
}
