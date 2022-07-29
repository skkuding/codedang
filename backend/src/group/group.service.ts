import { Injectable } from '@nestjs/common'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserGroupMembershipInfo(userId: number, groupId: number) {
    return await this.prisma.userGroup.findFirst({
      where: {
        user_id: userId,
        group_id: groupId
      },
      select: {
        is_registered: true,
        is_group_manager: true
      },
      rejectOnNotFound: () => new EntityNotExistException('user_group')
    })
  }
}
