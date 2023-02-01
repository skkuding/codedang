import { Injectable } from '@nestjs/common'
import {
  Contest,
  ContestPublicizingRequest,
  RequestStatus
} from '@prisma/client'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { GroupService } from 'src/group/group.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { CreateContestPublicizingRequestDto } from './dto/create-publicizing-request.dto'
import { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'
import { UpdateContestDto } from './dto/update-contest.dto'

@Injectable()
export class ContestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService
  ) {}

  private contestSelectOption = {
    id: true,
    title: true,
    startTime: true,
    endTime: true,
    type: true,
    group: { select: { id: true, groupName: true } }
  }

  async createContest(
    userId: number,
    contestDto: CreateContestDto
  ): Promise<Contest> {
    if (!this.isValidPeriod(contestDto.startTime, contestDto.endTime)) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }

    const contest: Contest = await this.prisma.contest.create({
      data: {
        title: contestDto.title,
        description: contestDto.description,
        descriptionSummary: contestDto.descriptionSummary,
        startTime: contestDto.startTime,
        endTime: contestDto.endTime,
        visible: contestDto.visible,
        isRankVisible: contestDto.isRankVisible,
        type: contestDto.type,
        group: {
          connect: { id: contestDto.groupId }
        },
        createdBy: {
          connect: { id: userId }
        }
      }
    })

    return contest
  }

  async updateContest(
    contestId: number,
    contestDto: UpdateContestDto
  ): Promise<Contest> {
    await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    if (!this.isValidPeriod(contestDto.startTime, contestDto.endTime)) {
      throw new UnprocessableDataException(
        'start time must be earlier than end time'
      )
    }

    return await this.prisma.contest.update({
      where: {
        id: contestId
      },
      data: {
        title: contestDto.title,
        description: contestDto.description,
        descriptionSummary: contestDto.descriptionSummary,
        startTime: contestDto.startTime,
        endTime: contestDto.endTime,
        visible: contestDto.visible,
        isRankVisible: contestDto.isRankVisible,
        type: contestDto.type
      }
    })
  }

  isValidPeriod(startTime: Date, endTime: Date): boolean {
    if (startTime > endTime) {
      return false
    }
    return true
  }

  async deleteContest(contestId: number) {
    await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    await this.prisma.contest.delete({
      where: {
        id: contestId
      }
    })
  }

  async getContests(userId: number): Promise<{
    registeredOngoing: Partial<Contest>[]
    registeredUpcoming: Partial<Contest>[]
    ongoing: Partial<Contest>[]
    upcoming: Partial<Contest>[]
    finished: Partial<Contest>[]
  }> {
    const registeredContests = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        contest: true
      }
    })

    let registered: string[]

    registeredContests.contest.forEach((contest) => {
      registered.push(contest.title)
    })

    const contests = await this.prisma.contest.findMany({
      where: {
        visible: true,
        title: {
          notIn: registered
        }
      },
      select: this.contestSelectOption
    })

    return {
      registeredOngoing: this.registeredOngoing(registeredContests.contest),
      registeredUpcoming: this.registeredUpcoming(registeredContests.contest),
      ongoing: this.filterOngoing(contests),
      upcoming: this.filterUpcoming(contests),
      finished: this.filterFinished(contests)
    }
  }

  startTimeCompare(a: Contest, b: Contest) {
    if (a.startTime < b.startTime) {
      return -1
    }
    if (a.startTime > b.startTime) {
      return 1
    }
    return 0
  }

  endTImeCompare(a: Contest, b: Contest) {
    if (a.endTime < b.endTime) {
      return -1
    }
    if (a.endTime > b.endTime) {
      return 1
    }
    return 0
  }

  registeredOngoing(
    registeredContests: Partial<Contest>[]
  ): Partial<Contest>[] {
    registeredContests.sort(this.endTImeCompare)
    const registeredOngoing = this.filterOngoing(registeredContests)

    return registeredOngoing
  }

  registeredUpcoming(
    registeredContests: Partial<Contest>[]
  ): Partial<Contest>[] {
    registeredContests.sort(this.startTimeCompare)
    const registeredUpcoming = this.filterUpcoming(registeredContests)

    return registeredUpcoming
  }

  filterRegisteredOn(
    registeredContests: Partial<Contest>[]
  ): Partial<Contest>[] {
    const now = new Date()
    const registeredOngoing = registeredContests.filter(
      (contest) => contest.startTime <= now && contest.endTime > now
    )

    return registeredOngoing
  }

  filterRegisteredUp(
    registeredContests: Partial<Contest>[]
  ): Partial<Contest>[] {
    const now = new Date()
    const registeredUpcoming = registeredContests.filter(
      (contest) => contest.startTime > now
    )

    return registeredUpcoming
  }

  filterOngoing(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    contests.sort(this.endTImeCompare)
    const ongoingContest = contests.filter(
      (contest) => contest.startTime <= now && contest.endTime > now
    )
    return ongoingContest
  }

  filterUpcoming(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    contests.sort(this.startTimeCompare)
    const upcomingContest = contests.filter(
      (contest) => contest.startTime > now
    )
    return upcomingContest
  }

  filterFinished(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    contests.sort(this.endTImeCompare)
    const finishedContest = contests.filter((contest) => contest.endTime <= now)
    return finishedContest
  }

  async getContestById(
    userId: number,
    contestId: number
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: { ...this.contestSelectOption, description: true, visible: true },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    const userGroup = await this.groupService.getUserGroupMembershipInfo(
      userId,
      contest.group.id
    )
    const isUserGroupMember = userGroup && userGroup.isRegistered
    const now = new Date()

    if (!isUserGroupMember && contest.endTime > now) {
      throw new ForbiddenAccessException(
        'Before the contest is ended, only group members can access'
      )
    }

    return contest
  }

  async getModalContestById(contestId: number): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        id: true,
        title: true,
        descriptionSummary: true
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    return contest
  }

  async getContestsByGroupId(groupId: number): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { groupId, visible: true },
      select: this.contestSelectOption
    })
  }

  async getAdminOngoingContests(): Promise<Partial<Contest>[]> {
    const contests = await this.getAdminContests()
    return this.filterOngoing(contests)
  }

  async getAdminContests(): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: {
        groupId: 1
      },
      select: { ...this.contestSelectOption, visible: true }
    })
  }

  async getAdminContestById(contestId: number): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        ...this.contestSelectOption,
        visible: true,
        description: true,
        descriptionSummary: true,
        isRankVisible: true
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    return contest
  }

  async getAdminContestsByGroupId(
    groupId: number
  ): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { groupId },
      select: { ...this.contestSelectOption, visible: true }
    })
  }

  async createContestPublicizingRequest(
    userId: number,
    { contestId, message }: CreateContestPublicizingRequestDto
  ): Promise<ContestPublicizingRequest> {
    const request = await this.prisma.contestPublicizingRequest.findFirst({
      where: {
        contestId,
        requestStatus: { in: [RequestStatus.Accepted, RequestStatus.Pending] }
      }
    })

    if (request) {
      throw new ActionNotAllowedException(
        'duplicated request',
        'request converting contest to be public'
      )
    }

    return await this.prisma.contestPublicizingRequest.create({
      data: {
        message: message,
        contest: {
          connect: {
            id: contestId
          }
        },
        createdBy: {
          connect: {
            id: userId
          }
        }
      }
    })
  }

  async deleteContestPublicizingRequest(requestId: number) {
    const request = await this.prisma.contestPublicizingRequest.findFirst({
      where: {
        id: requestId
      },
      select: {
        requestStatus: true
      },
      rejectOnNotFound: () =>
        new EntityNotExistException('ContestPublicizingRequest')
    })

    await this.deletePendingContestPublicizingRequest(
      request.requestStatus,
      requestId
    )
  }

  async deletePendingContestPublicizingRequest(
    requestStatus: RequestStatus,
    requestId: number
  ) {
    if (requestStatus != RequestStatus.Pending) {
      throw new ActionNotAllowedException(
        'deleting processed one',
        'request converting contest to be public'
      )
    }

    await this.prisma.contestPublicizingRequest.delete({
      where: {
        id: requestId
      }
    })
  }

  async getContestPublicizingRequests(
    contestId: number
  ): Promise<Partial<ContestPublicizingRequest>[]> {
    return await this.prisma.contestPublicizingRequest.findMany({
      where: {
        contestId
      },
      select: {
        id: true,
        requestStatus: true,
        createdBy: {
          select: {
            username: true
          }
        },
        createTime: true
      }
    })
  }

  async getContestPublicizingRequest(
    requestId: number
  ): Promise<Partial<ContestPublicizingRequest>> {
    return await this.prisma.contestPublicizingRequest.findFirst({
      where: {
        id: requestId
      },
      select: {
        id: true,
        message: true,
        requestStatus: true,
        createdBy: {
          select: {
            username: true
          }
        },
        createTime: true
      },
      rejectOnNotFound: () =>
        new EntityNotExistException('ContestPublicizingRequest')
    })
  }

  async respondContestPublicizingRequest(
    requestId: number,
    respondDto: RespondContestPublicizingRequestDto
  ): Promise<ContestPublicizingRequest> {
    const request = await this.prisma.contestPublicizingRequest.findUnique({
      where: {
        id: requestId
      },
      select: {
        requestStatus: true,
        contestId: true
      },
      rejectOnNotFound: () =>
        new EntityNotExistException('ContestPublicizingRequest')
    })

    if (request.requestStatus != RequestStatus.Pending) {
      throw new ActionNotAllowedException(
        'responding to processed one',
        'request converting contest to be public'
      )
    }

    if (respondDto.requestStatus == RequestStatus.Accepted) {
      await this.updateContestToPublic(request.contestId, true)
    } else if (respondDto.requestStatus == RequestStatus.Rejected) {
      await this.updateContestToPublic(request.contestId, false)
    }

    return await this.prisma.contestPublicizingRequest.update({
      where: {
        id: requestId
      },
      data: {
        requestStatus: respondDto.requestStatus
      }
    })
  }

  async updateContestToPublic(id: number, isPublic: boolean) {
    await this.prisma.contest.update({
      where: {
        id
      },
      data: {
        isPublic
      }
    })
  }

  async getPendingContestPublicizingRequests(): Promise<
    Partial<ContestPublicizingRequest>[]
  > {
    return await this.getAdminContestPublicizingRequests([
      RequestStatus.Pending
    ])
  }

  async getRespondedContestPublicizingRequests(): Promise<
    Partial<ContestPublicizingRequest>[]
  > {
    return await this.getAdminContestPublicizingRequests([
      RequestStatus.Accepted,
      RequestStatus.Rejected
    ])
  }

  async getAdminContestPublicizingRequests(
    whereOption: RequestStatus[]
  ): Promise<Partial<ContestPublicizingRequest>[]> {
    return await this.prisma.contestPublicizingRequest.findMany({
      where: {
        requestStatus: {
          in: whereOption
        }
      },
      select: {
        id: true,
        contestId: true,
        contest: {
          select: {
            title: true
          }
        },
        createdBy: {
          select: {
            username: true
          }
        },
        requestStatus: true,
        createTime: true
      }
    })
  }

  async getAdminContestPublicizingRequest(
    id: number
  ): Promise<Partial<ContestPublicizingRequest>> {
    return await this.prisma.contestPublicizingRequest.findUnique({
      where: {
        id
      },
      select: {
        contestId: true,
        contest: {
          select: {
            title: true,
            group: {
              select: {
                groupName: true
              }
            }
          }
        },
        createdBy: {
          select: {
            username: true
          }
        },
        message: true,
        requestStatus: true,
        createTime: true
      },
      rejectOnNotFound: () =>
        new EntityNotExistException('ContestPublicizingRequest')
    })
  }

  async createContestRecord(
    userId: number,
    contestId: number
  ): Promise<undefined> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: { startTime: true, endTime: true, type: true }
    })
    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    const isAlreadyRecord = await this.prisma.contestRecord.findFirst({
      where: { userId, contestId },
      select: { id: true }
    })
    if (isAlreadyRecord) {
      throw new ActionNotAllowedException('repetitive participation', 'contest')
    }
    const now = new Date()
    if (now < contest.startTime || now >= contest.endTime) {
      throw new ActionNotAllowedException('participation', 'ended contest')
    }

    if (contest.type === 'ACM') {
      await this.prisma.contestRankACM.create({
        data: { contestId, userId }
      })
    }
    // Todo: other contest type -> create other contest record table
    return
  }
}
