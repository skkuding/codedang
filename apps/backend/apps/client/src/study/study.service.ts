import { Injectable } from '@nestjs/common'
import { GroupType } from '@prisma/client'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { CreateStudyDto, UpdateStudyDto } from './dto/study.dto'

@Injectable()
export class StudyService {
  constructor(private readonly prisma: PrismaService) {}

  async createStudyGroup(userId: number, dto: CreateStudyDto) {
    const { tagIds, capacity, ...rest } = dto

    return this.prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          groupName: rest.groupName,
          groupType: GroupType.Study,
          description: rest.description,
          config: rest.config as object,
          studyInfo: {
            create: { capacity: capacity ?? 10 }
          },
          userGroup: {
            create: { userId, isGroupLeader: true }
          },
          ...(tagIds?.length && {
            groupTag: {
              createMany: {
                data: tagIds.map((tagId) => ({ tagId }))
              }
            }
          })
        },
        select: {
          id: true,
          groupName: true,
          description: true,
          config: true,
          studyInfo: { select: { capacity: true } },
          groupTag: {
            select: { tag: { select: { id: true, name: true } } }
          }
        }
      })

      return {
        ...group,
        tags: group.groupTag.map(({ tag }) => tag),
        groupTag: undefined
      }
    })
  }

  async getJoinedStudyGroups(userId: number) {
    const records = await this.prisma.userGroup.findMany({
      where: {
        userId,
        group: { groupType: GroupType.Study, NOT: { id: 1 } }
      },
      select: {
        isGroupLeader: true,
        group: {
          select: {
            id: true,
            groupName: true,
            description: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _count: { select: { userGroup: true } },
            studyInfo: { select: { capacity: true } },
            groupTag: {
              select: { tag: { select: { id: true, name: true } } }
            }
          }
        }
      },
      orderBy: { createTime: 'desc' }
    })

    return records.map(({ group, isGroupLeader }) => ({
      id: group.id,
      groupName: group.groupName,
      description: group.description,
      memberNum: group._count.userGroup,
      capacity: group.studyInfo?.capacity,
      isGroupLeader,
      tags: group.groupTag.map(({ tag }) => tag)
    }))
  }

  async getStudyGroup(groupId: number, userId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, groupType: GroupType.Study },
      select: {
        id: true,
        groupName: true,
        description: true,
        config: true,
        createTime: true,
        studyInfo: { select: { capacity: true } },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: { select: { userGroup: true } },
        groupTag: {
          select: { tag: { select: { id: true, name: true } } }
        },
        userGroup: {
          where: { userId },
          select: { isGroupLeader: true, totalStudyTime: true }
        }
      }
    })

    if (!group) {
      throw new EntityNotExistException('StudyGroup')
    }

    const membership = group.userGroup[0]

    return {
      id: group.id,
      groupName: group.groupName,
      description: group.description,
      config: group.config,
      createTime: group.createTime,
      capacity: group.studyInfo?.capacity,
      memberNum: group._count.userGroup,
      tags: group.groupTag.map(({ tag }) => tag),
      isJoined: !!membership,
      isGroupLeader: membership?.isGroupLeader ?? false,
      totalStudyTime: membership?.totalStudyTime ?? 0
    }
  }

  async updateStudyGroup(groupId: number, userId: number, dto: UpdateStudyDto) {
    await this.assertLeader(groupId, userId)

    const { tagIds, capacity, config, ...rest } = dto

    return this.prisma.$transaction(async (tx) => {
      if (tagIds !== undefined) {
        await tx.groupTag.deleteMany({ where: { groupId } })
        if (tagIds.length) {
          await tx.groupTag.createMany({
            data: tagIds.map((tagId) => ({ groupId, tagId }))
          })
        }
      }

      if (capacity !== undefined) {
        await tx.studyInfo.update({
          where: { groupId },
          data: { capacity }
        })
      }

      return tx.group.update({
        where: { id: groupId },
        data: {
          ...rest,
          ...(config && { config: config as object })
        },
        select: {
          id: true,
          groupName: true,
          description: true,
          config: true
        }
      })
    })
  }

  async deleteStudyGroup(groupId: number, userId: number) {
    await this.assertLeader(groupId, userId)
    return this.prisma.group.delete({ where: { id: groupId } })
  }

  async joinStudyGroup(groupId: number, userId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, groupType: GroupType.Study },
      select: {
        config: true,
        studyInfo: { select: { capacity: true } },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: { select: { userGroup: true } }
      }
    })

    if (!group) {
      throw new EntityNotExistException('StudyGroup')
    }

    if (
      group.studyInfo?.capacity &&
      group._count.userGroup >= group.studyInfo.capacity
    ) {
      throw new ConflictFoundException('Group is full')
    }

    const existing = await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: { userId, groupId }
      }
    })

    if (existing) {
      throw new ConflictFoundException('Already joined this group')
    }

    if (group.config?.['requireApprovalBeforeJoin']) {
      const pendingRequest = await this.prisma.groupJoinRequest.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_groupId: { userId, groupId }
        }
      })

      if (pendingRequest && pendingRequest.isAccepted === null) {
        throw new ConflictFoundException('Already requested to join')
      }

      await this.prisma.groupJoinRequest.upsert({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_groupId: { userId, groupId }
        },
        create: { userId, groupId },
        update: { isAccepted: null, requestTime: new Date() }
      })

      return { isJoined: false }
    }

    await this.prisma.userGroup.create({
      data: { userId, groupId, isGroupLeader: false }
    })

    return { isJoined: true }
  }

  async getJoinRequests(groupId: number, userId: number) {
    await this.assertLeader(groupId, userId)

    return this.prisma.groupJoinRequest.findMany({
      where: { groupId, isAccepted: null },
      select: {
        userId: true,
        requestTime: true,
        user: { select: { username: true, studentId: true } }
      },
      orderBy: { requestTime: 'asc' }
    })
  }

  async handleJoinRequest(
    groupId: number,
    leaderId: number,
    targetUserId: number,
    accept: boolean
  ) {
    await this.assertLeader(groupId, leaderId)

    const request = await this.prisma.groupJoinRequest.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: { userId: targetUserId, groupId }
      }
    })

    if (!request || request.isAccepted !== null) {
      throw new EntityNotExistException('JoinRequest')
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.groupJoinRequest.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_groupId: { userId: targetUserId, groupId }
        },
        data: { isAccepted: accept, processTime: new Date() }
      })

      if (accept) {
        await tx.userGroup.create({
          data: { userId: targetUserId, groupId, isGroupLeader: false }
        })
      }

      return { accepted: accept }
    })
  }

  async leaveStudyGroup(groupId: number, userId: number) {
    const membership = await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: { userId, groupId }
      },
      select: { isGroupLeader: true }
    })

    if (!membership) {
      throw new EntityNotExistException('Membership')
    }

    if (membership.isGroupLeader) {
      const leaderCount = await this.prisma.userGroup.count({
        where: { groupId, isGroupLeader: true }
      })
      if (leaderCount <= 1) {
        throw new ConflictFoundException('One or more leaders are required')
      }
    }

    return this.prisma.userGroup.delete({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: { userId, groupId }
      }
    })
  }

  async upsertDraft(userId: number, problemId: number, code: object) {
    return this.prisma.problemDraft.upsert({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_problemId: { userId, problemId }
      },
      create: { userId, problemId, code },
      update: { code }
    })
  }

  async getDraft(userId: number, problemId: number) {
    const draft = await this.prisma.problemDraft.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_problemId: { userId, problemId }
      }
    })

    if (!draft) {
      throw new EntityNotExistException('ProblemDraft')
    }

    return draft
  }

  async deleteDraft(userId: number, problemId: number) {
    const draft = await this.prisma.problemDraft.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_problemId: { userId, problemId }
      }
    })

    if (!draft) {
      throw new EntityNotExistException('ProblemDraft')
    }

    return this.prisma.problemDraft.delete({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_problemId: { userId, problemId }
      }
    })
  }

  private async assertLeader(groupId: number, userId: number) {
    const membership = await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: { userId, groupId }
      },
      select: { isGroupLeader: true }
    })

    if (!membership?.isGroupLeader) {
      throw new ForbiddenAccessException('Only leaders can perform this action')
    }
  }
}
