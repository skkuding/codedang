import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnprocessableEntityException,
  UseGuards
} from '@nestjs/common'
import { ContestService } from './contest.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { UpdateContestDto } from './dto/update-contest.dto'
import { Contest, Role } from '@prisma/client'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { GroupManagerGuard } from 'src/group/guard/group-manager.guard'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { Roles } from 'src/common/decorator/roles.decorator'

@Controller('admin/contest')
@UseGuards(RolesGuard)
@Roles(Role.GroupAdmin)
export class ContestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getAdminContests(
    @Req() req: AuthenticatedRequest
  ): Promise<Partial<Contest>[]> {
    return await this.contestService.getAdminContests(req.user.id)
  }

  @Get('ongoing')
  async getAdminOngoingContests(
    @Req() req: AuthenticatedRequest
  ): Promise<Partial<Contest>[]> {
    return await this.contestService.getAdminOngoingContests(req.user.id)
  }
}

@Controller('admin/group/:group_id/contest')
@UseGuards(RolesGuard, GroupManagerGuard)
export class GroupContestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  async createContest(
    @Req() req: AuthenticatedRequest,
    @Body() contestDto: CreateContestDto
  ): Promise<Contest> {
    try {
      return await this.contestService.createContest(req.user.id, contestDto)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Patch(':id')
  async updateContest(
    @Param('id', ParseIntPipe) id: number,
    @Body() contestDto: UpdateContestDto
  ): Promise<Contest> {
    try {
      return await this.contestService.updateContest(id, contestDto)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Delete(':id')
  async deleteContest(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.contestService.deleteContest(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  async getAdminContest(
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      return await this.contestService.getAdminContestById(contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getAdminContests(
    @Param('group_id', ParseIntPipe) groupId: number
  ): Promise<Partial<Contest>[]> {
    return await this.contestService.getAdminContestsByGroupId(groupId)
  }
}
