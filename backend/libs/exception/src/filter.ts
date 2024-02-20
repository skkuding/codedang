import {
  Catch,
  type ArgumentsHost,
  type ExceptionFilter,
  Logger,
  InternalServerErrorException
} from '@nestjs/common'
import { BusinessException } from '@libs/exception'

@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BusinessExceptionFilter.name)

  catch(exception: BusinessException, host: ArgumentsHost) {
    const newException = exception.convert2HTTPException()
    this.logger.log(newException)

    const ctx = host.switchToHttp()
    const res = ctx.getResponse()
    const status = newException.getStatus()

    res.status(status).json({
      statusCode: status,
      error: newException.name,
      message: newException.message
    })
  }
}

@Catch()
export class UnknownExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnknownExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const newException = new InternalServerErrorException()
    this.logger.error(exception)

    const ctx = host.switchToHttp()
    const res = ctx.getResponse()
    const status = newException.getStatus()

    res.status(status).json({
      statusCode: status,
      error: newException.name,
      message: newException.message
    })
  }
}
