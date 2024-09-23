import {
  Catch,
  type ArgumentsHost,
  Logger,
  HttpException,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import type { GqlExceptionFilter } from '@nestjs/graphql'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { BusinessException } from './business.exception'

@Catch()
export class AdminExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(AdminExceptionFilter.name)

  catch(exception: Error) {
    if (exception instanceof BusinessException) {
      this.logger.log(exception)
      return exception.convert2HTTPException()
    } else if (exception instanceof PrismaClientKnownRequestError) {
      this.logger.log(exception)
      return convertPrismaError2HTTPException(exception)
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
    } else if (exception instanceof PrismaClientKnownRequestError) {
      this.logger.log(exception)
      super.catch(convertPrismaError2HTTPException(exception), host)
    } else if (exception instanceof HttpException) {
      this.logger.log(exception)
      super.catch(exception, host)
    } else {
      this.logger.error(exception)
      super.catch(new InternalServerErrorException(), host)
    }
  }
}

/**
 * 데이터가 존재하지 않는 경우, Unique Constraint 위반 등의 사유로 발생하는 PrismaClientKnownRequestError를 HTTP Exception으로 변환
 * @param exception PrismaClientKnownRequestError
 * @returns HTTP Exception
 */
const convertPrismaError2HTTPException = (
  exception: PrismaClientKnownRequestError
) => {
  switch (exception.code) {
    case 'P2002': // Unique Constraint violation
      return new ConflictException(exception.message)
    case 'P2025': // Record not found
      return new NotFoundException(exception.message)
    case 'P2003': // Foreign key constraint violation
      return new UnprocessableEntityException(exception.message)
    default:
      return new BadRequestException(exception.message)
  }
}
