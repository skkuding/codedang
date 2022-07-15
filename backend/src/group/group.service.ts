import { Injectable } from '@nestjs/common'
import { UserGroup } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async isUserGroupMember(userId: number, groupId: number): Promise<boolean> {
    const userGroup: Partial<UserGroup> = await this.prisma.userGroup.findFirst(
      {
        where: {
          user_id: userId,
          group_id: groupId
        },
        select: {
          is_registered: true
        }
      }
    )

    if (!userGroup || !userGroup.is_registered) {
      return false
    }
    return true
  }

  async isUserGroupManager(userId: number, groupId: number): Promise<boolean> {
    const userGroup: Partial<UserGroup> = await this.prisma.userGroup.findFirst(
      {
        where: {
          user_id: userId,
          group_id: groupId
        },
        select: {
          is_group_manager: true,
          is_registered: true
        }
      }
    )

    if (!userGroup || !userGroup.is_registered || !userGroup.is_group_manager) {
      return false
    }
    return true
  }
}
