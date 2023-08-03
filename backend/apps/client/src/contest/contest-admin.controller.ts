import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  ConflictException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnprocessableEntityException,
  UseGuards
} from '@nestjs/common'
import { Role } from '@prisma/client'
import {
  AuthenticatedRequest,
  RolesGuard,
  Roles,
  GroupLeaderGuard
} from '@libs/auth'
import {
  ConflictFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { ContestService } from './contest.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'
import { UpdateContestDto } from './dto/update-contest.dto'

@Controller('admin/contest')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class ContestAdminController {
  private readonly logger = new Logger(ContestAdminController.name)

  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getAdminContests(
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.contestService.getAdminContests(cursor, take)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get('ongoing')
  async getAdminOngoingContests(
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.contestService.getAdminOngoingContests(cursor, take)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('admin/group/:groupId/contest')
@UseGuards(RolesGuard, GroupLeaderGuard)
export class GroupContestAdminController {
  private readonly logger = new Logger(GroupContestAdminController.name)

  constructor(private readonly contestService: ContestService) {}

  @Post()
  async createContest(
    @Req() req: AuthenticatedRequest,
    @Body() contestDto: CreateContestDto
  ) {
    try {
      return await this.contestService.createContest(contestDto, req.user.id)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Patch(':id')
  async updateContest(
    @Param('id', ParseIntPipe) id: number,
    @Body() contestDto: UpdateContestDto
  ) {
    try {
      return await this.contestService.updateContest(id, contestDto)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      this.logger.error(error.message, error.stack)
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
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  async getAdminContest(@Param('id', ParseIntPipe) contestId: number) {
    try {
      return await this.contestService.getAdminContest(contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getAdminContests(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.contestService.getAdminContests(cursor, take, groupId)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('admin/contest/publicizing-request')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class ContestPublicizingRequestAdminController {
  private readonly logger = new Logger(
    ContestPublicizingRequestAdminController.name
  )

  constructor(private readonly contestService: ContestService) {}

  @Get()
  async getContestPublicizingRequests() {
    try {
      return await this.contestService.getContestPublicizingRequests()
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Patch(':id')
  async respondContestPublicizingRequest(
    @Param('id', ParseIntPipe) contestId: number,
    @Body() body: RespondContestPublicizingRequestDto
  ) {
    try {
      await this.contestService.respondContestPublicizingRequest(
        contestId,
        body
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('admin/group/:groupId/contest/:contestId/publicizing-request')
@UseGuards(RolesGuard, GroupLeaderGuard)
export class ContestPublicizingRequestController {
  private readonly logger = new Logger(ContestPublicizingRequestController.name)

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
      if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}
