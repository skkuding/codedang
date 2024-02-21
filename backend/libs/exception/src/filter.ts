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
    if (exception instanceof BusinessException) {
      this.logger.error(exception, 'Business Exception')
      super.catch(exception.convert2HTTPException(), host)
    } else if (exception instanceof HttpException) {
      this.logger.error(exception, 'Http Exception')
      super.catch(exception, host)
    } else {
      this.logger.error(exception, 'Internal Exception')
      super.catch(new InternalServerErrorException(), host)
    }
  }
}
