import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common'
import { AuthNotNeeded, RolesGuard, GroupMemberGuard } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { ClarificationService } from './clarification.service'

@Controller('contest/:contestId')
@AuthNotNeeded()
export class ClarificationController {
  private readonly logger = new Logger(ClarificationController.name)

  constructor(private readonly clarificationService: ClarificationService) {}

  @Get('clarification')
  async getClarificationsByContest(
    @Param('contestId', ParseIntPipe) contestId: number
  ) {
    try {
      return await this.clarificationService.getClarificationsByContest(
        contestId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('problem/:problemId/clarification')
  async getClarificationsByProblem(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return await this.clarificationService.getClarificationsByProblem(
        contestId,
        problemId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/contest/:contestId')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupClarificationController {
  private readonly logger = new Logger(GroupClarificationController.name)
  constructor(private readonly clarificationService: ClarificationService) {}

  @Get('clarification')
  async getClarificationsByContest(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number
  ) {
    try {
      return await this.clarificationService.getClarificationsByContest(
        contestId,
        groupId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('problem/:problemId/clarification')
  async getClarificationsByProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return await this.clarificationService.getClarificationsByProblem(
        contestId,
        problemId,
        groupId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
