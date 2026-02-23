import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { GroupType, UserGroup, type User } from '@generated'
import { Role } from '@prisma/client'
import { Cache } from 'cache-manager'
import { joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { GroupJoinRequest } from '@libs/types'
import type { UpdateCreationPermissionsInput } from './model/creationPermission.model'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * 해당 아이디에 대한 유저 정보를 가져옵니다.
   *
   * @param {number} userId 유저의 아이디
   * @returns {User}해당 유저의 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - 해당 유저가 존재하지 않는 경우
   */
  async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    if (user == null) {
      throw new EntityNotExistException('User')
    }
    return user
  }

  /**
   * 페이지에 해당하는 유저의 userProfile을 포함한 정보를 가져옵니다.
   *
   * @param {number} cursor 페이지 커서
   * @param {number} take 가져올 유저의 수
   * @returns {User[]} 해당 유저의 profile을 포함한 정보의 배열을 가져옵니다.
   */
  async getUsers({ cursor, take }: { cursor: number | null; take: number }) {
    const paginator = this.prisma.getPaginator(cursor)

    return await this.prisma.user.findMany({
      ...paginator,
      take,
      include: {
        userProfile: true
      }
    })
  }

  /**
   * email 또는 studentId를 기준으로 유저의 userProfile을 포함한 정보를 가져옵니다.
   *
   * @param {string} email 유저의 이메일 주소
   * @param {string} studentId 학생 id
   * @returns {User[]} 조건에 대항하는 유저의 목록
   */
  async getUserByEmailOrStudentId(
    email?: string,
    studentId?: string
  ): Promise<User[]> {
    const whereOption = email ? { email } : { studentId }
    return await this.prisma.user.findMany({
      where: whereOption,
      include: {
        userProfile: true
      }
    })
  }

  /**
   *  수정 대상 유저에 대해 contest, course 생성 권한을 true로 변경합니다.
   *
   * @param {UpdateCreationPermissionsInput} input 생성 권한 입력값
   * @returns  수정된 유저의 권한 정보
   */
  async updateCreationPermissions(input: UpdateCreationPermissionsInput) {
    const { userId, ...data } = input
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data,
      select: {
        id: true,
        role: true,
        canCreateCourse: true,
        canCreateContest: true
      }
    })
  }
}

@Injectable()
export class GroupMemberService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /**
   * 특정 groupId의 그룹을 조회하여 멤버 목록을 가져옵니다.
   *
   * @param {number} groupId 대상 그룹의 id
   * @param {number} cursor 페이지 커서
   * @param {number} take 한 번에 조회할 멤버 수
   * @param {boolean} leaderOnly 리더 여부
   * @returns {GroupMember[]} 그룹 멤버 목록
   */
  async getGroupMembers({
    groupId,
    cursor,
    take,
    leaderOnly
  }: {
    groupId: number
    cursor: number | null
    take: number
    leaderOnly: boolean
  }) {
    const paginator = this.prisma.getPaginator(cursor, (value) => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      userId_groupId: {
        userId: value,
        groupId
      }
    }))

    const userGroups = await this.prisma.userGroup.findMany({
      ...paginator,
      take,
      where: {
        groupId,
        isGroupLeader: leaderOnly ? true : undefined
      },
      select: {
        isGroupLeader: true,
        user: {
          select: {
            id: true,
            username: true,
            userProfile: {
              select: {
                realName: true
              }
            },
            email: true,
            studentId: true,
            college: true,
            major: true,
            role: true
          }
        }
      }
    })

    return userGroups.map((userGroup) => {
      return {
        isGroupLeader: userGroup.isGroupLeader,
        username: userGroup.user.username,
        userId: userGroup.user.id,
        name: userGroup.user.userProfile?.realName ?? '',
        email: userGroup.user.email,
        studentId: userGroup.user.studentId,
        college: userGroup.user.college,
        major: userGroup.user.major,
        role: userGroup.user.role
      }
    })
  }

  /**
   * 특정 그룹에 속한 특정 유저의 정보를 가져옵니다.
   *
   * @param {number} groupId 해당 그룹의 id
   * @param {number} userId 해당 유저의 id
   * @returns {usergroup} 해당 유저의 정보
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - groupId와 userId에 대당하는 usergroup이 존재하지 않는 경우
   */
  async getGroupMember(groupId: number, userId: number) {
    const userGroup = await this.prisma.userGroup.findFirst({
      where: {
        groupId,
        userId
      },
      select: {
        isGroupLeader: true,
        user: {
          select: {
            id: true,
            username: true,
            userProfile: {
              select: {
                realName: true
              }
            },
            email: true,
            studentId: true,
            college: true,
            major: true,
            role: true
          }
        }
      }
    })
    if (!userGroup) {
      throw new EntityNotExistException('userGroup')
    }
    return {
      isGroupLeader: userGroup.isGroupLeader,
      username: userGroup.user.username,
      userId: userGroup.user.id,
      name: userGroup.user.userProfile?.realName ?? '',
      email: userGroup.user.email,
      studentId: userGroup.user.studentId,
      college: userGroup.user.college,
      major: userGroup.user.major,
      role: userGroup.user.role
    }
  }

  /**
   *  그룹 내 특정 유저의  groupleader 여부를 변경합니다.
   *
   * @param {number} userId 해당 유저의 id
   * @param {number} groupId 해당 그룹의 id
   * @param {boolean} toGroupLeader 변경할 groupleader 여부
   * @returns {userGroup} 업데이트된 userGroup 레코드
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - 해당 userId가 해당 groupId의 그룹 멤버가 아닌 경우
   * @throws {BadRequestException} 아래와 같은 경우 발생합니다.
   * - groupleader의 수가 1명 이하인데 groupleader 해제하려는 경우
   * - 이미 groupleader인 멤버를 다시 groupleader로 설정하려는 경우
   * - 이미 groupleader가 아닌 멤버를 groupleader 해제하려는 경우
   */
  async updateGroupRole(
    userId: number,
    groupId: number,
    toGroupLeader: boolean
  ) {
    const groupMember = await this.prisma.userGroup.findFirst({
      where: {
        groupId,
        userId
      },
      select: {
        user: {
          select: {
            role: true
          }
        },
        isGroupLeader: true
      }
    })

    if (groupMember === null) {
      throw new EntityNotExistException(
        `userId ${userId} is not a group member of groupId ${groupId}`
      )
    }

    const groupLeaderNum = await this.prisma.userGroup.count({
      where: {
        groupId,
        isGroupLeader: true
      }
    })

    if (groupMember.isGroupLeader && !toGroupLeader) {
      if (groupLeaderNum <= 1) {
        throw new BadRequestException('One or more leaders are required')
      }
    } else if (groupMember.isGroupLeader && toGroupLeader) {
      throw new BadRequestException(`The userId ${userId} is already manager`)
    } else if (!groupMember.isGroupLeader && !toGroupLeader) {
      throw new BadRequestException(`The userId ${userId} is already member`)
    }

    return await this.prisma.userGroup.update({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId
        }
      },
      data: {
        isGroupLeader: toGroupLeader
      }
    })
  }

  /**
   * 특정 그룹에서 특정 유저를 삭제합니다.
   * 그룹 타입이 course인 경우 해당 유저의 assignmentRecord도 함께 삭제합니다.
   *
   * @param {number} groupId 삭제하려는 멤버의 그룹 id
   * @param {number} userId 삭제하려는 멤버의 id
   * @returns {userGroup} 삭제된 usergroup의 레코드
   * @throws {UnprocessableDataException} 아래와 같은 경우 발생합니다.
   * -해당 유저가 해당 그룹의 멤버가 아닌 경우
   * @throws {BadRequestException} 아래와 같은 경우 발생합니다.
   * -삭제하려는 유저가 해당 그룹의 유일한 groupleader인 경우
   */
  async deleteGroupMember(groupId: number, userId: number): Promise<UserGroup> {
    const userGroup = await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId
        }
      },
      select: {
        isGroupLeader: true,
        group: {
          select: {
            groupType: true
          }
        }
      }
    })

    if (!userGroup) {
      throw new UnprocessableDataException('It is not a member')
    }

    if (userGroup.isGroupLeader) {
      const groupLeaderNum = await this.prisma.userGroup.count({
        where: {
          groupId,
          isGroupLeader: true
        }
      })
      if (groupLeaderNum <= 1) {
        throw new BadRequestException('One or more leaders are required')
      }
    }

    if (userGroup.group.groupType === GroupType.Course) {
      const assignmentIds = await this.prisma.assignment.findMany({
        where: {
          groupId
        },
        select: {
          id: true
        }
      })

      await this.prisma.assignmentRecord.deleteMany({
        where: {
          userId,
          assignmentId: {
            in: assignmentIds.map(({ id }) => id)
          }
        }
      })
    }

    return await this.prisma.userGroup.delete({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId
        }
      }
    })
  }

  /**
   * 대상 그룹의 가입 요청 목록을 가져옵니다.
   *
   * @param {number} groupId 대상 그룹의 id
   * @returns {user} 가입 요청한 유저의 목록
   */
  async getJoinRequests(groupId: number) {
    const groupJoinRequests = await this.cacheManager.get<GroupJoinRequest[]>(
      joinGroupCacheKey(groupId)
    )
    if (!groupJoinRequests) {
      return []
    }

    const validRequests = groupJoinRequests.filter(
      (req) => req.expiresAt > Date.now()
    )
    const userIds = validRequests.map((req) => req.userId)
    return await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      }
    })
  }

  /**
   * 특정 멤버의 특정 그룹 가입 요청을 처리합니다.
   *
   * @param {number} groupId 해당 그룹의 id
   * @param {number} userId 가입 요청을 처리할 유저의 id
   * @param {boolean} isAccepted 승인 거절 여부
   * @returns {userGroup | userId}
   * -승인 시: 생성된 userGroup의 레코드
   * -거절 시: userId
   * @throws {ConflictFoundException} 아래와 같은 경우 발생합니다.
   * -해당 유저가 가입 요청을 보내지 않은 경우
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * -해당 유저가 존재하지 않는 경우
   */
  async handleJoinRequest(
    groupId: number,
    userId: number,
    isAccepted: boolean
  ): Promise<UserGroup | number> {
    const groupJoinRequests =
      (await this.cacheManager.get<GroupJoinRequest[]>(
        joinGroupCacheKey(groupId)
      )) || []

    const validRequests = groupJoinRequests.filter(
      (req) => req.expiresAt > Date.now()
    )

    const userRequested = validRequests.find((req) => req.userId === userId)

    if (!userRequested) {
      throw new ConflictFoundException(
        `The userId ${userId} didn't request join to groupId ${groupId}`
      )
    }

    const remainingRequests = validRequests.filter(
      (req) => req.userId !== userId
    )

    await this.cacheManager.set(
      joinGroupCacheKey(groupId),
      remainingRequests,
      JOIN_GROUP_REQUEST_EXPIRE_TIME
    )
    if (isAccepted) {
      const requestedUser = await this.prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          role: true
        }
      })

      if (!requestedUser) {
        throw new EntityNotExistException(`userId ${userId}`)
      }

      return await this.prisma.userGroup.create({
        data: {
          user: {
            connect: { id: userId }
          },
          group: {
            connect: { id: groupId }
          },
          isGroupLeader:
            requestedUser.role == Role.Admin ||
            requestedUser.role == Role.SuperAdmin
        }
      })
    } else {
      return userId
    }
  }
}
