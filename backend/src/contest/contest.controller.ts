import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put
} from '@nestjs/common'
import { ContestService } from './contest.service'
import { ContestDto } from './dto/contest.dto'
import { Contest } from '@prisma/client'

@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  async create(@Body() contestData: ContestDto): Promise<Contest> {
    try {
      const contest = await this.contestService.create(contestData)
      return contest
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNPROCESSABLE_ENTITY)
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<string> {
    try {
      const result = await this.contestService.delete(id)
      return result
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.NOT_FOUND)
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() contestData: ContestDto
  ): Promise<Contest> {
    try {
      const contest = await this.contestService.update(id, contestData)
      return contest
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNPROCESSABLE_ENTITY)
    }
  }
}
