import { Injectable } from '@nestjs/common'
import { UserGroup } from '@prisma/client'
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
      }
    })
  }

  async getUserGroupManagerList(userId: number): Promise<number[]> {
    return (
      await this.prisma.userGroup.findMany({
        where: {
          user_id: userId,
          is_registered: true,
          is_group_manager: true
        },
        select: {
          group_id: true
        }
      })
    ).map((group) => group.group_id)
  }
}
