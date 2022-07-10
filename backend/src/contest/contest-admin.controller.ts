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

@Controller('admin/group/:group_id/contest')
export class ContestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  async createContest(@Body() contestData: ContestDto): Promise<Contest> {
    try {
      const contest = await this.contestService.createContest(1, contestData)
      return contest
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNPROCESSABLE_ENTITY)
    }
  }

  @Delete(':id')
  async deleteContest(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.contestService.deleteContest(id)
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.NOT_FOUND)
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
      throw new HttpException(err.message, HttpStatus.UNPROCESSABLE_ENTITY)
    }
  }
}
