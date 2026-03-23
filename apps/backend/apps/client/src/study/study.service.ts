import { Injectable } from '@nestjs/common'
import { GroupType } from '@prisma/client'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CreateStudyDto, UpdateStudyDto } from './dto/study.dto'

@Injectable()
export class StudyService {
  constructor(private readonly prisma: PrismaService) {}

  async createStudyGroup(userId: number, dto: CreateStudyDto) {
    const {
      groupName,
      description,
      capacity,
      problemIds,
      invitationCode,
      durationHours
    } = dto

    let tags: { tagId: number }[] = []

    if (problemIds && problemIds.length > 0)
      tags = await this.prisma.problemTag.findMany({
        where: {
          problemId: {
            in: problemIds
          }
        },
        select: {
          tagId: true
        },
        distinct: ['tagId']
      })

    const endTime = new Date()
    endTime.setHours(endTime.getHours() + durationHours)

    return await this.prisma.group.create({
      data: {
        groupName,
        groupType: GroupType.Study,
        description,
        config: {
          showOnList: true,
          allowJoinFromSearch: true,
          allowJoinWithURL: false,
          requireApprovalBeforeJoin: false
        },
        userGroup: {
          create: {
            userId,
            isGroupLeader: true
          }
        },
        sharedProblems: {
          connect: problemIds?.map((problemId) => ({ id: problemId }))
        },
        groupTag: {
          createMany: {
            data: tags.map((tag) => ({ tagId: tag.tagId }))
          }
        },
        studyInfo: {
          create: {
            capacity,
            invitationCode,
            endTime
          }
        }
      }
    })
  }

  async getStudyGroups({
    userId,
    cursor = null,
    take = 10
  }: {
    userId: number | null
    cursor?: number | null
    take?: number
  }) {
    const paginator = this.prisma.getPaginator(cursor)

    const studyGroups = await this.prisma.group.findMany({
      ...paginator,
      take,
      where: {
        groupType: GroupType.Study
      },
      select: {
        id: true,
        groupName: true,
        description: true,
        userGroup: {
          select: {
            user: {
              select: {
                username: true
              }
            },
            isGroupLeader: true
          }
        },
        groupTag: {
          select: {
            tag: {
              select: {
                name: true
              }
            }
          }
        },
        ...(userId && {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _count: {
            select: {
              userGroup: {
                where: { userId }
              }
            }
          }
        }),
        studyInfo: {
          select: {
            capacity: true,
            invitationCode: true,
            endTime: true
          }
        }
      },
      orderBy: {
        createTime: 'desc'
      }
    })

    const now = new Date()

    return studyGroups.map((studyGroup) => ({
      id: studyGroup.id,
      groupName: studyGroup.groupName,
      description: studyGroup.description,
      leader: studyGroup.userGroup.find((user) => user.isGroupLeader === true)
        ?.user.username,
      currentMember: studyGroup.userGroup.length,
      capacity: studyGroup.studyInfo?.capacity,
      tags: studyGroup.groupTag.map((tag) => tag.tag.name),
      isPublic: !studyGroup.studyInfo?.invitationCode,
      isJoined: userId ? studyGroup._count.userGroup > 0 : false,
      isEnded: studyGroup.studyInfo?.endTime
        ? now >= studyGroup.studyInfo.endTime
        : false
    }))
  }

  async getStudyGroup(groupId: number, userId: number) {
    const studyGroup = await this.prisma.group.findUnique({
      where: {
        id: groupId,
        groupType: GroupType.Study
      },
      select: {
        id: true,
        groupName: true,
        description: true,
        userGroup: {
          select: {
            userId: true,
            user: {
              select: {
                username: true
              }
            },
            isGroupLeader: true
          }
        },
        sharedProblems: {
          select: {
            id: true,
            title: true
          },
          orderBy: {
            id: 'asc'
          }
        },
        groupTag: {
          select: {
            tag: {
              select: {
                name: true
              }
            }
          }
        },
        studyInfo: {
          select: {
            capacity: true
          }
        }
      }
    })

    if (!studyGroup) throw new EntityNotExistException('StudyGroup')

    const isJoined = studyGroup.userGroup.some((user) => user.userId === userId)

    if (!isJoined)
      throw new ForbiddenAccessException(
        'You must join this study group first.'
      )

    return {
      id: studyGroup.id,
      groupName: studyGroup.groupName,
      description: studyGroup.description,
      capacity: studyGroup.studyInfo?.capacity,
      tags: studyGroup.groupTag.map((tag) => tag.tag.name),

      currentMember: studyGroup.userGroup.length,
      members: studyGroup.userGroup.map((user) => ({
        userId: user.userId,
        username: user.user.username,
        isGroupLeader: user.isGroupLeader
      })),

      problems: studyGroup.sharedProblems
    }
  }

  async updateStudyGroup(groupId: number, dto: UpdateStudyDto) {
    return await this.prisma.$transaction(async (tx) => {
      const studyGroup = await tx.group.findUnique({
        where: {
          id: groupId,
          groupType: GroupType.Study
        },
        select: {
          createTime: true,
          studyInfo: {
            select: {
              capacity: true,
              endTime: true
            }
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _count: {
            select: {
              userGroup: true
            }
          }
        }
      })

      if (!studyGroup) {
        throw new EntityNotExistException('StudyGroup')
      }

      if (
        studyGroup.studyInfo?.endTime &&
        new Date() >= studyGroup.studyInfo.endTime
      ) {
        throw new ConflictFoundException('Cannot update an ended study group.')
      }

      if (dto.capacity && dto.capacity < studyGroup._count.userGroup)
        throw new ConflictFoundException(
          'Capacity cannot be less than current members'
        )

      const {
        groupName,
        description,
        capacity,
        problemIds,
        invitationCode,
        durationHours
      } = dto

      let tags: { tagId: number }[] = []
      if (problemIds && problemIds.length > 0)
        tags = await tx.problemTag.findMany({
          where: {
            problemId: {
              in: problemIds
            }
          },
          select: {
            tagId: true
          },
          distinct: ['tagId']
        })

      let newEndTime: Date | undefined = undefined
      if (durationHours !== undefined) {
        newEndTime = new Date(studyGroup.createTime)
        newEndTime.setHours(newEndTime.getHours() + durationHours)

        if (new Date() >= newEndTime)
          throw new ConflictFoundException(
            'The updated end time cannot be in the past.'
          )
      }

      const studyInfoUpdate =
        capacity !== undefined ||
        invitationCode !== undefined ||
        newEndTime !== undefined

      return await tx.group.update({
        where: {
          id: groupId,
          groupType: GroupType.Study
        },
        data: {
          groupName,
          description,
          ...(studyInfoUpdate && {
            studyInfo: {
              update: {
                capacity,
                invitationCode,
                endTime: newEndTime
              }
            }
          }),
          ...(problemIds && {
            groupTag: {
              deleteMany: {},
              create: tags.map((tag) => ({ tagId: tag.tagId }))
            },
            sharedProblems: {
              set: problemIds.map((id) => ({ id }))
            }
          })
        }
      })
    })
  }

  async deleteStudyGroup(groupId: number) {
    const studyGroup = await this.prisma.group.findUnique({
      where: {
        id: groupId,
        groupType: GroupType.Study
      },
      select: { id: true }
    })

    if (!studyGroup) {
      throw new EntityNotExistException('StudyGroup')
    }

    await this.prisma.group.delete({
      where: {
        id: groupId
      }
    })
  }

  async joinStudyGroupById(
    userId: number,
    groupId: number,
    invitation?: string
  ) {
    const studyGroup = await this.prisma.group.findUnique({
      where: {
        id: groupId,
        groupType: GroupType.Study
      },
      select: {
        studyInfo: {
          select: {
            capacity: true,
            invitationCode: true,
            endTime: true
          }
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: {
            userGroup: true
          }
        }
      }
    })

    if (!studyGroup) {
      throw new EntityNotExistException('StudyGroup')
    }

    const isJoined = await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId
        }
      }
    })

    if (isJoined)
      throw new ConflictFoundException('Already joined this Study group')

    if (
      studyGroup.studyInfo &&
      studyGroup.studyInfo.capacity <= studyGroup._count.userGroup
    )
      throw new ConflictFoundException('Study group capacity exceeded')

    if (
      studyGroup.studyInfo?.invitationCode &&
      studyGroup.studyInfo.invitationCode !== invitation
    )
      throw new ConflictFoundException('Invalid invitation code')

    if (
      studyGroup.studyInfo?.endTime &&
      studyGroup.studyInfo?.endTime <= new Date()
    )
      throw new ConflictFoundException('Cannot join an ended study group')

    return await this.prisma.userGroup.create({
      data: {
        userId,
        groupId
      }
    })
  }
}
