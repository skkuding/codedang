import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common'
import { ClarificationService } from './clarification.service'
import { AuthNotNeeded } from '@client/common/decorator/auth-ignore.decorator'
import { EntityNotExistException } from '@client/common/exception/business.exception'
import { type Clarification } from '@prisma/client'
import { RolesGuard } from '@admin/user/guard/roles.guard'
import { GroupMemberGuard } from '@client/group/guard/group-member.guard'

@Controller('contest/:contestId')
@AuthNotNeeded()
export class ClarificationController {
  constructor(private readonly clarificationService: ClarificationService) {}

  @Get('clarification')
  async getClarificationsByContest(
    @Param('contestId', ParseIntPipe) contestId: number
  ): Promise<Partial<Clarification>[]> {
    try {
      return await this.clarificationService.getClarificationsByContest(
        contestId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get('problem/:problemId/clarification')
  async getClarificationsByProblem(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<Partial<Clarification>[]> {
    try {
      return await this.clarificationService.getClarificationsByProblem(
        contestId,
        problemId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/contest/:contestId')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupClarificationController {
  constructor(private readonly clarificationService: ClarificationService) {}

  @Get('clarification')
  async getClarificationsByContest(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number
  ): Promise<Partial<Clarification>[]> {
    try {
      return await this.clarificationService.getClarificationsByContest(
        contestId,
        groupId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get('problem/:problemId/clarification')
  async getClarificationsByProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<Partial<Clarification>[]> {
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
      throw new InternalServerErrorException()
    }
  }
}
