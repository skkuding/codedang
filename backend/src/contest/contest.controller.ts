import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put
} from '@nestjs/common'
import { ContestService } from './contest.service'
import { ContestDto } from './dto/contest.dto'

@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  async create(@Body() contestData: ContestDto) {
    return await this.contestService.create(contestData)
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.contestService.delete(id)
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() contestData: ContestDto
  ) {
    return await this.contestService.update(id, contestData)
  }
}
