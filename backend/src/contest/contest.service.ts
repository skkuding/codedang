import { Injectable } from '@nestjs/common'
import { Contest, ContestToPublicRequest, RequestStatus } from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { GroupService } from 'src/group/group.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { CreateContestToPublicRequestDto } from './dto/create-topublic-request.dto'
import { RespondContestToPublicRequestDto } from './dto/respond-topublic-request.dto'
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
        descriptionSummary: contestDto.description,
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

  async createContestToPublicRequest(
    userId: number,
    { contest_id, message }: CreateContestToPublicRequestDto
  ): Promise<ContestToPublicRequest> {
    const request = await this.prisma.contestToPublicRequest.findUnique({
      where: {
        contest_id
      },
      select: {
        request_status: true
      }
    })

    if (request) {
      await this.deleteUnaccepteContestToPublicRequest(
        request.request_status,
        contest_id
      )
    }

    return await this.prisma.contestToPublicRequest.create({
      data: {
        message: message,
        contest: {
          connect: {
            id: contest_id
          }
        },
        created_by: {
          connect: {
            id: userId
          }
        }
      }
    })
  }

  async deleteUnaccepteContestToPublicRequest(
    requestStatus: RequestStatus,
    contest_id: number
  ) {
    if (requestStatus == RequestStatus.Accept) {
      throw new UnprocessableDataException(
        'This contest is already accepted to be public'
      )
    } else {
      await this.prisma.contestToPublicRequest.delete({
        where: {
          contest_id
        }
      })
    }
  }

  async deleteContestToPublicRequest(contestId: number) {
    const request = await this.prisma.contestToPublicRequest.findUnique({
      where: {
        contest_id: contestId
      },
      select: {
        request_status: true
      },
      rejectOnNotFound: () =>
        new EntityNotExistException('ContestToPublicRequest')
    })

    await this.deleteUnaccepteContestToPublicRequest(
      request.request_status,
      contestId
    )
  }

  async getContestToPublicRequest(
    contestId: number
  ): Promise<Partial<ContestToPublicRequest>> {
    return await this.prisma.contestToPublicRequest.findUnique({
      where: {
        contest_id: contestId
      },
      select: {
        contest_id: true,
        message: true,
        request_status: true,
        created_by: {
          select: {
            username: true
          }
        },
        create_time: true
      },
      rejectOnNotFound: () =>
        new EntityNotExistException('ContestToPublicRequest')
    })
  }

  async respondContestToPublicRequest(
    contestId: number,
    respondContestToPublicRequestDto: RespondContestToPublicRequestDto
  ): Promise<ContestToPublicRequest> {
    await this.prisma.contestToPublicRequest.findUnique({
      where: {
        contest_id: contestId
      },
      select: {
        request_status: true
      },
      rejectOnNotFound: () =>
        new EntityNotExistException('ContestToPublicRequest')
    })

    if (
      respondContestToPublicRequestDto.request_status == RequestStatus.Accept
    ) {
      this.updateContestIsPublic(contestId, true)
    } else {
      this.updateContestIsPublic(contestId, false)
    }

    return await this.prisma.contestToPublicRequest.update({
      where: {
        contest_id: contestId
      },
      data: {
        request_status: respondContestToPublicRequestDto.request_status
      }
    })
  }

  async updateContestIsPublic(id: number, isPublic: boolean) {
    await this.prisma.contest.update({
      where: {
        id
      },
      data: {
        is_public: isPublic
      }
    })
  }

  async getPendingContestToPublicRequests(): Promise<
    Partial<ContestToPublicRequest>[]
  > {
    return await this.getAdminContestToPublicRequests([RequestStatus.Pending])
  }

  async getRespondedContestToPublicRequests(): Promise<
    Partial<ContestToPublicRequest>[]
  > {
    return await this.getAdminContestToPublicRequests([
      RequestStatus.Accept,
      RequestStatus.Reject
    ])
  }

  async getAdminContestToPublicRequests(
    whereOption: RequestStatus[]
  ): Promise<Partial<ContestToPublicRequest>[]> {
    return await this.prisma.contestToPublicRequest.findMany({
      where: {
        request_status: {
          in: whereOption
        }
      },
      select: {
        contest_id: true,
        contest: {
          select: {
            title: true
          }
        },
        created_by: {
          select: {
            username: true
          }
        },
        request_status: true,
        create_time: true
      }
    })
  }

  async getAdminContestToPublicRequest(
    contestId: number
  ): Promise<Partial<ContestToPublicRequest>> {
    return await this.prisma.contestToPublicRequest.findUnique({
      where: {
        contest_id: contestId
      },
      select: {
        contest_id: true,
        contest: {
          select: {
            title: true,
            group: {
              select: {
                group_name: true
              }
            }
          }
        },
        created_by: {
          select: {
            username: true
          }
        },
        message: true,
        request_status: true,
        create_time: true
      },
      rejectOnNotFound: () =>
        new EntityNotExistException('ContestToPublicRequest')
    })
  }

  async getContests(): Promise<{
    ongoing: Partial<Contest>[]
    upcoming: Partial<Contest>[]
    finished: Partial<Contest>[]
  }> {
    const contests = await this.prisma.contest.findMany({
      where: { visible: true },
      select: this.contestSelectOption
    })
    return {
      ongoing: this.filterOngoing(contests),
      upcoming: this.filterUpcoming(contests),
      finished: this.filterFinished(contests)
    }
  }

  filterOngoing(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    const ongoingContest = contests.filter(
      (contest) => contest.startTime <= now && contest.endTime > now
    )
    return ongoingContest
  }

  filterUpcoming(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    const ongoingContest = contests.filter((contest) => contest.startTime > now)
    return ongoingContest
  }

  filterFinished(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    const ongoingContest = contests.filter((contest) => contest.endTime <= now)
    return ongoingContest
  }

  async getContestById(
    userId: number,
    contestId: number
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: { ...this.contestSelectOption, description: true, visible: true },
      rejectOnNotFound: () => new EntityNotExistException('Contest')
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
      rejectOnNotFound: () => new EntityNotExistException('Contest')
    })

    return contest
  }

  async getContestsByGroupId(groupId: number): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { groupId: groupId, visible: true },
      select: this.contestSelectOption
    })
  }

  async getAdminOngoingContests(userId: number): Promise<Partial<Contest>[]> {
    const contests = await this.getAdminContests(userId)
    return this.filterOngoing(contests)
  }

  async getAdminContests(userId: number): Promise<Partial<Contest>[]> {
    const groupIds = await this.groupService.getUserGroupManagerList(userId)
    return await this.prisma.contest.findMany({
      where: {
        groupId: { in: groupIds }
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
      rejectOnNotFound: () => new EntityNotExistException('Contest')
    })

    return contest
  }

  async getAdminContestsByGroupId(
    groupId: number
  ): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { groupId: groupId },
      select: { ...this.contestSelectOption, visible: true }
    })
  }
}
