import {
  Catch,
  type ArgumentsHost,
  type ExceptionFilter,
  Logger
} from '@nestjs/common'
import {
  UnauthorizedException,
  type HttpException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  ForbiddenException,
  InternalServerErrorException
} from '@nestjs/common/exceptions'

abstract class BusinessException extends Error {
  name: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }

  abstract convert2HTTPException(message?: string): HttpException
}

/** [401] Throw when a user cannot be identified with given credential. */
export class UnidentifiedException extends BusinessException {
  constructor(credential) {
    super(`Incorrect ${credential}`)
  }

  convert2HTTPException(message?: string) {
    return new UnauthorizedException(message ?? this.message)
  }
}

/** [401] Throw when JWT token is invalid. */
export class InvalidJwtTokenException extends BusinessException {
  constructor(message) {
    super(`Invalid token: ${message}`)
  }

  convert2HTTPException(message?: string) {
    return new UnauthorizedException(message ?? this.message)
  }
}

/** [404] Throw when requested entity is not found. */
export class EntityNotExistException extends BusinessException {
  constructor(entity) {
    super(`${entity} does not exist`)
  }

  convert2HTTPException(message?: string) {
    return new NotFoundException(message ?? this.message)
  }
}

/** [409] Throw when the request has a conflict with relevant entities.
 * e.g., participation is not allowed to ended contest.
 */
export class ConflictFoundException extends BusinessException {
  convert2HTTPException(message?: string) {
    return new ConflictException(message ?? this.message)
  }
}

/** [409] Throw when the request has a conflict with relevant entities.
 * e.g., group name is already in use
 */
export class DuplicateFoundException extends ConflictFoundException {
  constructor(entity) {
    super(`${entity} is already in use`)
  }
}

/** [422] Throw when data is invalid or cannot be processed. */
export class UnprocessableDataException extends BusinessException {
  convert2HTTPException(message?: string) {
    return new UnprocessableEntityException(message ?? this.message)
  }
}

/** [422] Throw when file data is invalid or cannot be processed. */
export class UnprocessableFileDataException extends UnprocessableDataException {
  constructor(message, fileName, rowNumber) {
    super(`${message} @${fileName}:${rowNumber}`)
  }
}

/** [403] Throw when request cannot be carried due to lack of permission. */
export class ForbiddenAccessException extends BusinessException {
  convert2HTTPException(message?: string) {
    return new ForbiddenException(message ?? this.message)
  }
}

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
