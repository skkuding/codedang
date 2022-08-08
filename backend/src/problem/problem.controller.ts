import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { Problem } from '@prisma/client'
import { Public } from 'src/common/decorator/public.decorator'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { GroupMemberGuard } from 'src/group/guard/group-member.guard'
import { PaginationDto } from '../common/dto/pagination.dto'
import { ProblemService } from './problem.service'

@Public()
@Controller()
export class PublicProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get('problem/:id')
  async getPublicProblem(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Partial<Problem>> {
    try {
      return await this.problemService.getPublicProblem(id)
    } catch (err) {
      console.log(err)
      if (err instanceof EntityNotExistException) {
        new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get('problems')
  async getPublicProblems(@Query() paginationDto: PaginationDto) {
    try {
      return this.problemService.getPublicProblems(paginationDto)
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}

@Public()
@Controller('contest')
export class PublicContestProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get(':contestId/problem/:problemId')
  async getPublicContestProblem(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return this.problemService.getPublicContestProblem(contestId, problemId)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':contestId/problems')
  async getPublicContestProblems(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query() paginationDto: PaginationDto
  ) {
    try {
      return this.problemService.getPublicContestProblems(
        contestId,
        paginationDto
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}

@Public()
@Controller('workbook')
export class PublicWorkbookProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get(':workbookId/problem/:problemId')
  async getPublicWorkbookProblem(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return this.problemService.getPublicWorkbookProblem(workbookId, problemId)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':workbookId/problems')
  async getPublicWorkbookProblems(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query() paginationDto: PaginationDto
  ) {
    try {
      return this.problemService.getPublicWorkbookProblems(
        workbookId,
        paginationDto
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}

@UseGuards(GroupMemberGuard)
@Controller('group')
export class GroupContestProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get(':groupId/contest/:contestId/problem/:problemId')
  async getGroupContestProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return this.problemService.getGroupContestProblem(
        groupId,
        contestId,
        problemId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/contest/:contestId/problems')
  async getGroupContestProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query() paginationDto: PaginationDto
  ) {
    try {
      return this.problemService.getGroupContestProblems(
        groupId,
        contestId,
        paginationDto
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}

@UseGuards(GroupMemberGuard)
@Controller('group')
export class GroupWorkbookProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get(':groupId/workbook/:workbookId/problem/:problemId')
  async getGroupWorkbookProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return this.problemService.getGroupWorkbookProblem(
        groupId,
        workbookId,
        problemId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/workbook/:workbookId/problems')
  async getGroupWorkbookProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query() paginationDto: PaginationDto
  ) {
    try {
      return this.problemService.getGroupWorkbookProblems(
        groupId,
        workbookId,
        paginationDto
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}
