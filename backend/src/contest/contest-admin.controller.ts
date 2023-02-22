import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  MethodNotAllowedException,
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
  ActionNotAllowedException,
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { GroupLeaderGuard } from 'src/group/guard/group-leader.guard'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { Roles } from 'src/common/decorator/roles.decorator'
import { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'

@Controller('admin/contest')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class ContestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getAdminContests(): Promise<Partial<Contest>[]> {
    return await this.contestService.getAdminContestsByGroupId()
  }
}

@Controller('admin/group/:groupId/contest')
@UseGuards(RolesGuard, GroupLeaderGuard)
export class GroupContestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  async createContest(
    @Req() req: AuthenticatedRequest,
    @Body() contestDto: CreateContestDto
  ): Promise<Contest> {
    try {
      return await this.contestService.createContest(contestDto, req.user.id)
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
      } else if (error instanceof UnprocessableDataException) {
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
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Partial<Contest>[]> {
    return await this.contestService.getAdminContestsByGroupId(groupId)
  }
}

@Controller('admin/contest/publicizing-request')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class ContestPublicizingRequestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getContestPublicizingRequests() {
    try {
      return await this.contestService.getContestPublicizingRequests()
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Patch('/:id')
  async respondContestPublicizingRequest(
    @Param('id', ParseIntPipe) contestId: number,
    @Body()
    respondContestPublicizingRequestDto: RespondContestPublicizingRequestDto
  ) {
    try {
      await this.contestService.respondContestPublicizingRequest(
        contestId,
        respondContestPublicizingRequestDto
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Controller('admin/group/:groupId/contest/:contestId/publicizing-request')
@UseGuards(RolesGuard, GroupLeaderGuard)
export class ContestPublicizingRequestController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  async createContestPublicizingRequest(
    @Req() req: AuthenticatedRequest,
    @Param() contestId: number
  ) {
    try {
      return await this.contestService.createContestPublicizingRequest(
        contestId,
        req.user.id
      )
    } catch (error) {
      if (error instanceof ActionNotAllowedException) {
        throw new MethodNotAllowedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
