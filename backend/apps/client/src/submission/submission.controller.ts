import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,
  Req,
  ParseIntPipe,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  ForbiddenException,
  Logger
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthenticatedRequest, GroupMemberGuard } from '@libs/auth'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { SubmissionService } from './submission.service'

@Controller('problem/:problemId/submission')
export class ProblemSubmissionController {
  private readonly logger = new Logger(ProblemSubmissionController.name)

  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Body() submissionDto: CreateSubmissionDto
  ) {
    try {
      return await this.submissionService.submitToProblem(
        submissionDto,
        req.user.id,
        problemId
      )
    } catch (error) {
      if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getSubmissions(@Param('problemId', ParseIntPipe) problemId: number) {
    return await this.submissionService.getSubmissions(problemId)
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ) {
    try {
      return await this.submissionService.getSubmission(
        id,
        problemId,
        req.user.id
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/problem/:problemId/submission')
@UseGuards(GroupMemberGuard)
export class GroupProblemSubmissionController {
  private readonly logger = new Logger(GroupProblemSubmissionController.name)

  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Body() submissionDto: CreateSubmissionDto
  ) {
    try {
      return await this.submissionService.submitToProblem(
        submissionDto,
        req.user.id,
        problemId,
        groupId
      )
    } catch (error) {
      if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getSubmissions(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    return await this.submissionService.getSubmissions(problemId, groupId)
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ) {
    try {
      return await this.submissionService.getSubmission(
        id,
        problemId,
        req.user.id,
        groupId
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('contest/:contestId/problem/:problemId/submission')
export class ContestSubmissionController {
  private readonly logger = new Logger(ContestSubmissionController.name)

  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Body() submissionDto: CreateSubmissionDto
  ) {
    try {
      return await this.submissionService.submitToContest(
        submissionDto,
        req.user.id,
        problemId,
        contestId
      )
    } catch (error) {
      if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      } else if (
        error instanceof EntityNotExistException ||
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.name == 'NotFoundError')
      ) {
        throw new NotFoundException(error)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getSubmissions(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    return await this.submissionService.getContestSubmissions(
      problemId,
      contestId,
      req.user.id
    )
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ) {
    try {
      return await this.submissionService.getContestSubmission(
        id,
        problemId,
        contestId,
        req.user.id
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/contest/:contestId/problem/:problemId/submission')
@UseGuards(GroupMemberGuard)
export class GroupContestSubmissionController {
  private readonly logger = new Logger(GroupContestSubmissionController.name)

  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Body() submissionDto: CreateSubmissionDto
  ) {
    try {
      return await this.submissionService.submitToContest(
        submissionDto,
        req.user.id,
        problemId,
        contestId,
        groupId
      )
    } catch (error) {
      if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      } else if (
        error instanceof EntityNotExistException ||
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.name == 'NotFoundError')
      ) {
        throw new NotFoundException(error)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getSubmissions(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    return await this.submissionService.getContestSubmissions(
      problemId,
      contestId,
      req.user.id,
      groupId
    )
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ) {
    try {
      return await this.submissionService.getContestSubmission(
        id,
        problemId,
        contestId,
        req.user.id,
        groupId
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('workbook/:workbookId/problem/:problemId/submission')
export class WorkbookSubmissionController {
  private readonly logger = new Logger(WorkbookSubmissionController.name)

  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Body() submissionDto: CreateSubmissionDto
  ) {
    try {
      return await this.submissionService.submitToWorkbook(
        submissionDto,
        req.user.id,
        problemId,
        workbookId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getSubmissions(@Param('problemId', ParseIntPipe) problemId: number) {
    return await this.submissionService.getSubmissions(problemId)
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ) {
    try {
      return await this.submissionService.getSubmission(
        id,
        problemId,
        req.user.id
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/workbook/:workbookId/problem/:problemId/submission')
@UseGuards(GroupMemberGuard)
export class GroupWorkbookSubmissionController {
  private readonly logger = new Logger(GroupWorkbookSubmissionController.name)

  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Body() submissionDto: CreateSubmissionDto
  ) {
    try {
      return await this.submissionService.submitToWorkbook(
        submissionDto,
        req.user.id,
        problemId,
        workbookId,
        groupId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getSubmissions(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    return await this.submissionService.getSubmissions(problemId, groupId)
  }

  @Get(':id')
  async getSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('id') id: string
  ) {
    try {
      return await this.submissionService.getSubmission(
        id,
        problemId,
        req.user.id,
        groupId
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
