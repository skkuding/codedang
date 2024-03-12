import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import type { AuthenticatedUser } from '@libs/auth'
import { invitationCodeKey, invitationGroupKey } from '@libs/cache'
import { INVIATION_EXPIRE_TIME, OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  DuplicateFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { CreateGroupInput, UpdateGroupInput } from './model/group.input'

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async createGroup(input: CreateGroupInput, userId: number) {
    const duplicateName = await this.prisma.group.findUnique({
      where: {
        groupName: input.groupName
      }
    })
    if (duplicateName) {
      throw new DuplicateFoundException('Group name')
    }
    if (!input.config.showOnList) {
      input.config.allowJoinFromSearch = false
    }

    const group = await this.prisma.group.create({
      data: {
        groupName: input.groupName,
        description: input.description,
        config: JSON.stringify(input.config)
      }
    })
    await this.prisma.userGroup.create({
      data: {
        user: {
          connect: { id: userId }
        },
        group: {
          connect: { id: group.id }
        },
        isGroupLeader: true
      }
    })
    return group
  }

  async getGroups(cursor: number | null, take: number) {
    const paginator = this.prisma.getPaginator(cursor)

    return (
      await this.prisma.group.findMany({
        ...paginator,
        take,
        select: {
          id: true,
          groupName: true,
          description: true,
          config: true,
          userGroup: true
        }
      })
    ).map((data) => {
      const { userGroup, ...group } = data
      return {
        ...group,
        memberNum: userGroup.length
      }
    })
  }

  async getGroup(id: number) {
    const data = await this.prisma.group.findUnique({
      where: {
        id
      },
      include: {
        userGroup: true
      }
    })

    if (!data) {
      throw new EntityNotExistException('Group')
    }

    const { userGroup, ...group } = data
    const code = await this.cacheManager.get<string>(invitationGroupKey(id))

    return {
      ...group,
      memberNum: userGroup.length,
      ...(code && { invitationURL: '/invite/' + code })
    }
  }

  async getGroupById(id: number) {
    const group = await this.prisma.group.findUnique({
      where: {
        id
      }
    })
    if (group == null) {
      throw new EntityNotExistException('Group')
    }
    return group
  }

  async updateGroup(id: number, input: UpdateGroupInput) {
    if (id === OPEN_SPACE_ID) {
      throw new ForbiddenAccessException('Open space cannot be updated')
    }
    const duplicateName = await this.prisma.group.findFirst({
      where: {
        NOT: {
          id
        },
        groupName: input.groupName
      }
    })
    if (duplicateName) {
      throw new DuplicateFoundException('Group name')
    }

    if (!input.config.showOnList) {
      input.config.allowJoinFromSearch = false
    }
    return await this.prisma.group.update({
      where: {
        id
      },
      data: {
        groupName: input.groupName,
        description: input.description,
        config: JSON.stringify(input.config)
      }
    })
  }

  async deleteGroup(id: number, user: AuthenticatedUser) {
    if (id === OPEN_SPACE_ID) {
      throw new ForbiddenAccessException('Open space cannot be deleted')
    } else if (!user.isAdmin() && !user.isSuperAdmin()) {
      const userGroup = await this.prisma.userGroup.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_groupId: {
            userId: user.id,
            groupId: id
          }
        },
        select: {
          isGroupLeader: true
        }
      })

      if (!userGroup?.isGroupLeader) {
        throw new ForbiddenAccessException(
          'If not admin, only group leader can delete a group'
        )
      }
    }

    return await this.prisma.userGroup.deleteMany({
      where: {
        groupId: id
      }
    })
  }

  async issueInvitation(id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      select: {
        config: true
      }
    })
    if (!group) {
      throw new EntityNotExistException('Group')
    }
    if (!group.config?.['allowJoinWithURL']) {
      throw new ConflictFoundException(
        'Allow join by url in group configuration to make invitation'
      )
    }

    let invitation
    do {
      invitation = Math.floor(Math.random() * 16 ** 6)
        .toString(16)
        .padStart(6, '0')
    } while (await this.cacheManager.get(invitationCodeKey(invitation)))

    await this.revokeInvitation(id)
    await this.cacheManager.set(
      invitationCodeKey(invitation),
      id,
      INVIATION_EXPIRE_TIME
    )
    await this.cacheManager.set(
      invitationGroupKey(id),
      invitation,
      INVIATION_EXPIRE_TIME
    )
    return invitation
  }

  async revokeInvitation(id: number) {
    const invitation = await this.cacheManager.get<string>(
      invitationGroupKey(id)
    )
    if (!invitation) {
      return 'This group has no invitation to be revoked'
    }
    await this.cacheManager.del(invitationCodeKey(invitation))
    await this.cacheManager.del(invitationGroupKey(id))
    return `Revoked invitation code: ${invitation}`
  }
}
