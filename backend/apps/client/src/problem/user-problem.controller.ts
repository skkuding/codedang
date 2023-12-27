import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req
} from '@nestjs/common'
import { Prisma, Role } from '@prisma/client'
import { AuthenticatedRequest, UseRolesGuard } from '@libs/auth'
import {
  ConflictFoundException,
  ForbiddenAccessException
} from '@libs/exception'
import { CreateTemplateDto } from './dto/create-user-problem.dto'
import { UserProblemService } from './problem.service'

@Controller('user/problem/:problemId')
@UseRolesGuard(Role.User)
export class UserProblemController {
  private readonly logger = new Logger(UserProblemController.name)

  constructor(private readonly userProblemService: UserProblemService) {}

  @Get()
  async getUserCode(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return await this.userProblemService.getUserCode(req.user.id, problemId)
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.name === 'NotFoundError'
      ) {
        throw new NotFoundException(err.message)
      } else if (err instanceof ForbiddenAccessException) {
        throw new BadRequestException(err.message)
      }
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }

  @Post()
  async createUserCode(
    @Req() req: AuthenticatedRequest,
    @Body() createTemplateDto: CreateTemplateDto,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return await this.userProblemService.createUserCode(
        req.user.id,
        createTemplateDto,
        problemId
      )
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.name == 'NotFoundError'
      ) {
        throw new NotFoundException(err.message)
      } else if (err instanceof ForbiddenAccessException) {
        throw new BadRequestException(err.message)
      } else if (err instanceof ConflictFoundException) {
        throw new ConflictFoundException(err.message)
      }
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }

  @Put()
  async updateUserCode(
    @Req() req: AuthenticatedRequest,
    @Body() createTemplateDto: CreateTemplateDto,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return await this.userProblemService.updateUserCode(
        req.user.id,
        createTemplateDto,
        problemId
      )
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.name === 'NotFoundError'
      ) {
        throw new NotFoundException(err.message)
      } else if (err instanceof ForbiddenAccessException) {
        throw new BadRequestException(err.message)
      }
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }
}
