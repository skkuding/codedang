import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Put,
  Req
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthenticatedRequest } from '@libs/auth'
import { RequiredIntPipe } from '@libs/pipe'
import { CreateTemplateDto } from './dto/create-code-draft.dto'
import { CodeDraftService } from './problem.service'

@Controller('user/problem/:problemId')
export class CodeDraftController {
  private readonly logger = new Logger(CodeDraftController.name)

  constructor(private readonly codeDraftService: CodeDraftService) {}

  @Get()
  async getCodeDraft(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    try {
      return await this.codeDraftService.getCodeDraft(req.user.id, problemId)
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.name === 'NotFoundError'
      ) {
        throw new NotFoundException(err.message)
      }
      this.logger.error(err)
      throw new InternalServerErrorException()
    }
  }

  @Put()
  async upsertCodeDraft(
    @Req() req: AuthenticatedRequest,
    @Body() createTemplateDto: CreateTemplateDto,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    try {
      return await this.codeDraftService.upsertCodeDraft(
        req.user.id,
        problemId,
        createTemplateDto
      )
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        // foreign key constraint failed error code
        err.code == 'P2003'
      ) {
        throw new NotFoundException(err.message)
      }
      this.logger.error(err)
      throw new InternalServerErrorException()
    }
  }
}
