import {
  Catch,
  type ArgumentsHost,
  Logger,
  HttpException,
  InternalServerErrorException
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { BusinessException } from './business.exception'

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: Error, host: ArgumentsHost) {
    if (exception instanceof BusinessException) {
      this.logger.log(exception)
      super.catch(exception.convert2HTTPException(), host)
    } else if (exception instanceof HttpException) {
      this.logger.log(exception)
      super.catch(exception, host)
    } else {
      this.logger.error(exception)
      super.catch(new InternalServerErrorException(), host)
    }
  }
}
