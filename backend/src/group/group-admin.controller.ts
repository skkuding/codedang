import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  MethodNotAllowedException,
  NotFoundException,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { GroupService } from './group.service'
import { Group, Role, UserGroup } from '@prisma/client'
import { Roles } from 'src/common/decorator/roles.decorator'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { GroupManagerGuard } from './guard/group-manager.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import {
  ActionNotAllowedException,
  EntityNotExistException
} from 'src/common/exception/business.exception'
import { RequestGroupDto } from './dto/request-group.dto'
import { Membership } from './interface/membership.interface'
import { CreateMemberDto } from './dto/create-member.dto'

@Controller('admin/group')
@Roles(Role.GroupAdmin)
@UseGuards(RolesGuard)
export class GroupAdminController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async createGroup(
    @Req() req: AuthenticatedRequest,
    @Body() groupDto: RequestGroupDto
  ): Promise<Group> {
    return await this.groupService.createGroup(req.user.id, groupDto)
  }

  @Get()
  async getGroups(@Req() req: AuthenticatedRequest): Promise<Partial<Group>[]> {
    return await this.groupService.getAdminGroups(req.user.id)
  }

  @Get(':groupId')
  @UseGuards(GroupManagerGuard)
  async getGroup(
    @Param('groupId', ParseIntPipe) id: number
  ): Promise<Partial<Group>> {
    try {
      return await this.groupService.getAdminGroup(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Patch(':groupId')
  @UseGuards(GroupManagerGuard)
  async updateGroup(
    @Param('groupId', ParseIntPipe) id: number,
    @Body() groupDto: RequestGroupDto
  ): Promise<Group> {
    try {
      return await this.groupService.updateGroup(id, groupDto)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Delete(':groupId')
  @UseGuards(GroupManagerGuard)
  async deleteGroup(@Param('groupId', ParseIntPipe) id: number) {
    try {
      return await this.groupService.deleteGroup(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Controller('admin/group/:groupId/member')
@UseGuards(GroupManagerGuard)
export class GroupMemberController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async createMembers(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() memberDto: CreateMemberDto[]
  ): Promise<number[]> {
    return await this.groupService.createMembers(groupId, memberDto)
  }

  @Get()
  async getMembers(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Membership[]> {
    return await this.groupService.getAdminMembers(groupId, offset - 1)
  }

  @Get('manager')
  async getManagers(
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Membership[]> {
    return await this.groupService.getAdminManagers(groupId)
  }

  @Get('pending')
  async getPendingMembers(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Membership[]> {
    return await this.groupService.getAdminPendingMembers(groupId, offset - 1)
  }

  @Patch('pending')
  async registerMember(
    @Body('ids', ParseArrayPipe) ids: number[]
  ): Promise<{ count: number }> {
    return await this.groupService.registerMembers(ids)
  }

  @Patch(':id')
  async gradeMember(
    @Param('id', ParseIntPipe) id: number,
    @Body('isGroupManager', ParseBoolPipe) role: boolean
  ): Promise<UserGroup> {
    try {
      return await this.groupService.gradeMember(id, role)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ActionNotAllowedException) {
        throw new MethodNotAllowedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Delete(':id')
  async deleteMember(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.groupService.deleteMember(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
