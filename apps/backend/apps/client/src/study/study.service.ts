import { Injectable } from '@nestjs/common'
import { GroupType } from '@prisma/client'
import {
  ConflictFoundException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CreateStudyDto, UpdateStudyDto } from './dto/study.dto'

@Injectable()
export class StudyService {
  constructor(private readonly prisma: PrismaService) {}

  async createStudyGroup(userId: number, dto: CreateStudyDto) {
    const { groupName, description, capacity, problemIds, invitationCode } = dto

    const tags = await this.prisma.problemTag.findMany({
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
          connect: problemIds?.map((problmeId) => ({ id: problmeId }))
        },
        groupTag: {
          createMany: {
            data: tags.map((tag) => ({ tagId: tag.tagId }))
          }
        },
        studyInfo: {
          create: {
            capacity,
            invitationCode
          }
        }
      }
    })
  }

  async getStudyGroups(userId?: number) {
    const studyGroups = await this.prisma.group.findMany({
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
            invitationCode: true
          }
        }
      },
      orderBy: {
        createTime: 'desc'
      }
    })

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
      isJoined: userId ? studyGroup._count.userGroup > 0 : false
    }))
  }

  async updateStudyGroup(groupId: number, dto: UpdateStudyDto) {
    const studyGroup = await this.prisma.group.findUnique({
      where: {
        id: groupId,
        groupType: GroupType.Study
      },
      select: {
        studyInfo: {
          select: {
            capacity: true
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

    if (dto.capacity && dto.capacity < studyGroup._count.userGroup)
      throw new ConflictFoundException('')

    const { groupName, description, capacity, problemIds, invitationCode } = dto

    let tags: { tagId: number }[] = []
    if (problemIds)
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

    const studyInfoUpdate =
      capacity !== undefined || invitationCode !== undefined

    await this.prisma.group.update({
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
              invitationCode
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
  }

  async deleteStudyGroup(groupId: number) {
    const studyGroup = await this.prisma.group.findUnique({
      where: {
        id: groupId
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
            invitationCode: true
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

    return await this.prisma.userGroup.create({
      data: {
        userId,
        groupId
      }
    })
  }
}
