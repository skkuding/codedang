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
export class ServiceExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(ServiceExceptionFilter.name)

  catch(exception: Error, host: ArgumentsHost) {
    this.logger.error(exception)

    if (exception instanceof BusinessException) {
      super.catch(exception.convert2HTTPException(), host)
    } else if (exception instanceof HttpException) {
      super.catch(exception, host)
    } else {
      super.catch(new InternalServerErrorException(), host)
    }
  }
}
