import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UnprocessableEntityException
} from '@nestjs/common'
import { ContestService } from './contest.service'
import { ContestDto } from './dto/contest.dto'
import { Contest } from '@prisma/client'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'

@Controller('admin/group/:group_id/contest')
export class ContestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  async createContest(@Body() contestData: ContestDto): Promise<Contest> {
    try {
      const contest = await this.contestService.createContest(1, contestData)
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
