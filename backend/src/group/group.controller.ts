import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Req,
  UnauthorizedException
} from '@nestjs/common'
import { Group } from '@prisma/client'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import {
  EntityNotExistException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { GroupService } from './group.service'

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get(':group_id')
  async getGroupById(
    @Req() req: AuthenticatedRequest,
    @Param('group_id', ParseIntPipe) groupId: number
  ): Promise<Partial<Group>> {
    try {
      return await this.groupService.getGroupById(req.user.id, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof InvalidUserException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
