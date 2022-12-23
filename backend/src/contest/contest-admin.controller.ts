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
import { GroupManagerGuard } from 'src/group/guard/group-manager.guard'
import { CreateContestPublicizingRequestDto } from './dto/create-publicizing-request.dto'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { Roles } from 'src/common/decorator/roles.decorator'
import { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'

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
export class ContestPublicizingRequestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Patch('/:contestId/to-public/:requestId')
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

  @Get('/to-public/pending')
  async getPendingContestPublicizingRequests(): Promise<
    Partial<ContestPublicizingRequest>[]
  > {
    try {
      return await this.contestService.getPendingContestPublicizingRequests()
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/to-public/responded')
  async getRespondedContestPublicizingRequests(): Promise<
    Partial<ContestPublicizingRequest>[]
  > {
    try {
      return await this.contestService.getRespondedContestPublicizingRequests()
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/:contestId/to-public/:requestId')
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

@Controller('admin/group/:groupId/contest/:contestId/to-public')
@UseGuards(RolesGuard, GroupManagerGuard)
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

  @Delete('/:id')
  async deleteContestPublicizingRequest(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('id', ParseIntPipe) requestId: number
  ) {
    try {
      await this.contestService.deleteContestPublicizingRequest(
        contestId,
        requestId
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

  @Get('/:id')
  async getContestPublicizingRequest(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('id', ParseIntPipe) requestId: number
  ): Promise<Partial<ContestPublicizingRequest>> {
    try {
      return await this.contestService.getContestPublicizingRequest(
        contestId,
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
