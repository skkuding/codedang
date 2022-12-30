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
import { Contest, ContestPublicizingRequest, Role } from '@prisma/client'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { GroupLeaderGuard } from 'src/group/guard/group-leader.guard'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { Roles } from 'src/common/decorator/roles.decorator'
import { CreateContestPublicizingRequestDto } from './dto/create-publicizing-request.dto'
import { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'

@Controller('admin/contest')
@UseGuards(RolesGuard)
@Roles(Role.Manager)
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
@UseGuards(RolesGuard, GroupLeaderGuard)
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

@Controller('admin/contest/publicizing-request')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class ContestPublicizingRequestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Patch('/:requestId')
  async respondContestPublicizingRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body()
    respondContestPublicizingRequestDto: RespondContestPublicizingRequestDto
  ): Promise<ContestPublicizingRequest> {
    try {
      return await this.contestService.respondContestPublicizingRequest(
        requestId,
        respondContestPublicizingRequestDto
      )
    } catch (error) {
      if (error instanceof ActionNotAllowedException) {
        throw new MethodNotAllowedException(error.message)
      }
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }

  @Get('/pending')
  async getPendingContestPublicizingRequests(): Promise<
    Partial<ContestPublicizingRequest>[]
  > {
    try {
      return await this.contestService.getPendingContestPublicizingRequests()
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/responded')
  async getRespondedContestPublicizingRequests(): Promise<
    Partial<ContestPublicizingRequest>[]
  > {
    try {
      return await this.contestService.getRespondedContestPublicizingRequests()
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/:requestId')
  async getContestPublicizingRequest(
    @Param('requestId', ParseIntPipe) requestId: number
  ): Promise<Partial<ContestPublicizingRequest>> {
    try {
      return await this.contestService.getAdminContestPublicizingRequest(
        requestId
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
    @Body()
    createContestPublicizingRequestDto: CreateContestPublicizingRequestDto
  ) {
    try {
      return await this.contestService.createContestPublicizingRequest(
        req.user.id,
        createContestPublicizingRequestDto
      )
    } catch (error) {
      if (error instanceof ActionNotAllowedException) {
        throw new MethodNotAllowedException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }

  @Delete('/:requestId')
  async deleteContestPublicizingRequest(
    @Param('requestId', ParseIntPipe) requestId: number
  ) {
    try {
      await this.contestService.deleteContestPublicizingRequest(requestId)
    } catch (error) {
      if (error instanceof ActionNotAllowedException) {
        throw new MethodNotAllowedException(error.message)
      }
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getContestPublicizingRequests(
    @Param('contestId', ParseIntPipe) contestId: number
  ): Promise<Partial<ContestPublicizingRequest>[]> {
    try {
      return await this.contestService.getContestPublicizingRequests(contestId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/:requestId')
  async getContestPublicizingRequest(
    @Param('requestId', ParseIntPipe) requestId: number
  ): Promise<Partial<ContestPublicizingRequest>> {
    try {
      return await this.contestService.getContestPublicizingRequest(requestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }
}
