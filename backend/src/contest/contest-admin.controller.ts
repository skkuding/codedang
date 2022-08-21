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
import { Contest, ContestToPublicRequest, Role } from '@prisma/client'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { GroupManagerGuard } from 'src/group/guard/group-manager.guard'
import { CreateContestToPublicRequestDto } from './dto/create-topublic-request.dto'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { Roles } from 'src/common/decorator/roles.decorator'
import { RespondContestToPublicRequestDto } from './dto/respond-topublic-request.dto'

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

@Controller('admin/group/:groupId/contest')
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
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Partial<Contest>[]> {
    return await this.contestService.getAdminContestsByGroupId(groupId)
  }
}

@Controller('admin/contest')
@UseGuards(RolesGuard)
@Roles(Role.SuperManager)
export class ContestToPublicRequestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Patch('/:id/to-public')
  async respondContestToPublicRequest(
    @Param('id', ParseIntPipe) contestId: number,
    @Body() respondContestToPublicRequestDto: RespondContestToPublicRequestDto
  ): Promise<ContestToPublicRequest> {
    try {
      return await this.contestService.respondContestToPublicRequest(
        contestId,
        respondContestToPublicRequestDto
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }

  @Get('/to-public/pending')
  async getPendingContestToPublicRequests(): Promise<
    Partial<ContestToPublicRequest>[]
  > {
    try {
      return await this.contestService.getPendingContestToPublicRequests()
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/to-public/responded')
  async getRespondedContestToPublicRequests(): Promise<
    Partial<ContestToPublicRequest>[]
  > {
    try {
      return await this.contestService.getRespondedContestToPublicRequests()
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/:id/to-public')
  async getContestToPublicRequest(
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<ContestToPublicRequest>> {
    try {
      return await this.contestService.getAdminContestToPublicRequest(contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }
}

@Controller('admin/group/:group_id/contest')
@UseGuards(RolesGuard, GroupManagerGuard)
export class ContestToPublicRequestController {
  constructor(private readonly contestService: ContestService) {}

  @Post('/:id/to-public')
  async createContestToPublicRequest(
    @Req() req: AuthenticatedRequest,
    @Body() createContestToPublicRequestDto: CreateContestToPublicRequestDto
  ) {
    try {
      return await this.contestService.createContestToPublicRequest(
        req.user.id,
        createContestToPublicRequestDto
      )
    } catch (error) {
      if (error instanceof ActionNotAllowedException) {
        throw new MethodNotAllowedException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }

  @Delete('/:id/to-public')
  async deleteContestToPublicRequest(
    @Param('id', ParseIntPipe) contestId: number
  ) {
    try {
      await this.contestService.deleteContestToPublicRequest(contestId)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }

  @Get('/:id/to-public')
  async getContestToPublicRequest(
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<ContestToPublicRequest>> {
    try {
      return await this.contestService.getContestToPublicRequest(contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }
}
