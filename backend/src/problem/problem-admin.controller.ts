import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Query,
  UseGuards
} from '@nestjs/common'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { GroupManagerGuard } from 'src/group/guard/group-manager.guard'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { ProblemAdminService } from './problem-admin.service'
import { ProblemService } from './problem.service'

@Controller('admin/group/:groupId')
@UseGuards(RolesGuard, GroupManagerGuard)
export class GroupProblemAdminController {
  constructor(private readonly problemAdminService: ProblemAdminService) {}

  @Get('problem/:problemId')
  async getGroupProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      await this.problemAdminService.getGroupProblem(groupId, problemId)
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }

  @Get('problems')
  async getGroupProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() paginationDto: PaginationDto
  ) {
    try {
      await this.problemAdminService.getGroupProblems(groupId, paginationDto)
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}

@Controller('admin/group/:groupId/contest/:contestId')
@UseGuards(RolesGuard, GroupManagerGuard)
export class ContestProblemAdminController {
  constructor(private readonly problemAdminService: ProblemAdminService) {}

  @Get('problem/:problemId')
  async getGruopContestProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      await this.problemAdminService.getGroupContestProblem(
        groupId,
        contestId,
        problemId
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }

  @Get('problems')
  async getGroupContestProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query() paginationDto: PaginationDto
  ) {
    try {
      await this.problemAdminService.getGroupContestProblems(
        groupId,
        contestId,
        paginationDto
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}

@Controller('admin/group/:groupId/workbook/:workbookId')
@UseGuards(RolesGuard, GroupManagerGuard)
export class WorkbookProblemAdminController {
  constructor(private readonly problemAdminService: ProblemAdminService) {}

  @Get('problem/:problemId')
  async getGroupWorkbookProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      await this.problemAdminService.getGroupWorkbookProblem(
        groupId,
        workbookId,
        problemId
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }

  @Get('problems')
  async getGroupWorkbookProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query() paginationDto: PaginationDto
  ) {
    try {
      await this.problemAdminService.getGroupWorkbookProblems(
        groupId,
        workbookId,
        paginationDto
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}
