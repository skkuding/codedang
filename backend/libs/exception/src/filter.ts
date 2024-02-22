import {
  Catch,
  type ArgumentsHost,
  Logger,
  HttpException,
  InternalServerErrorException
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import type { GqlExceptionFilter } from '@nestjs/graphql'
import { BusinessException } from './business.exception'

@Catch()
export class AdminExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(AdminExceptionFilter.name)

  catch(exception: Error) {
    if (exception instanceof BusinessException) {
      this.logger.log(exception)
      return exception.convert2HTTPException()
    } else if (exception instanceof HttpException) {
      this.logger.log(exception)
      return exception
    } else {
      this.logger.error(exception)
      return new InternalServerErrorException()
    }
  }
}
@Catch()
export class ClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(ClientExceptionFilter.name)

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
