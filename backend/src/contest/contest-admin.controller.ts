import {
  Body,
  Controller,
  Delete,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UnprocessableEntityException,
  UseGuards
} from '@nestjs/common'
import { ContestService } from './contest.service'
import { ContestDto } from './dto/contest.dto'
import { Contest } from '@prisma/client'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'

@Controller('admin/group/:group_id/contest')
@UseGuards(JwtAuthGuard)
export class ContestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  async createContest(
    @Req() req: AuthenticatedRequest,
    @Body() contestData: ContestDto
  ): Promise<Contest> {
    try {
      const contest = await this.contestService.createContest(
        req.user.id,
        contestData
      )
      return contest
    } catch (err) {
      if (err instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Delete(':id')
  async deleteContest(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.contestService.deleteContest(id)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Put(':id')
  async updateContest(
    @Param('id', ParseIntPipe) id: number,
    @Body() contestData: ContestDto
  ): Promise<Contest> {
    try {
      const contest = await this.contestService.updateContest(id, contestData)
      return contest
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      if (err instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
