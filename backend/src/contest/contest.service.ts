import { Injectable } from '@nestjs/common'
import { Contest, ContestToPublicRequest, RequestStatus } from '@prisma/client'
import {
  ActionNotAllowedException,
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
      (contest) => contest.start_time <= now && contest.end_time > now
    )
    return ongoingContest
  }

  filterUpcoming(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    const ongoingContest = contests.filter(
      (contest) => contest.start_time > now
    )
    return ongoingContest
  }

  filterFinished(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    const ongoingContest = contests.filter((contest) => contest.end_time <= now)
    return ongoingContest
  }

  async getContestById(
    user_id: number,
    contest_id: number
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: { ...this.contestSelectOption, description: true, visible: true },
      rejectOnNotFound: () => new EntityNotExistException('Contest')
    })

    const userGroup = await this.groupService.getUserGroupMembershipInfo(
      user_id,
      contest.group.group_id
    )
    const isUserGroupMember = userGroup && userGroup.is_registered
    const now = new Date()

    if (!isUserGroupMember && contest.end_time > now) {
      throw new ForbiddenAccessException(
        'Before the contest is ended, only group members can access'
      )
    }

    return contest
  }

  async getModalContestById(contest_id: number): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: {
        id: true,
        title: true,
        description_summary: true
      },
      rejectOnNotFound: () => new EntityNotExistException('Contest')
    })

    return contest
  }

  async getContestsByGroupId(group_id: number): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { group_id, visible: true },
      select: this.contestSelectOption
    })
  }

  async getAdminOngoingContests(user_id: number): Promise<Partial<Contest>[]> {
    const contests = await this.getAdminContests(user_id)
    return this.filterOngoing(contests)
  }

  async getAdminContests(user_id: number): Promise<Partial<Contest>[]> {
    const groupIds = await this.groupService.getUserGroupManagerList(user_id)
    return await this.prisma.contest.findMany({
      where: {
        group_id: { in: groupIds }
      },
      select: { ...this.contestSelectOption, visible: true }
    })
  }

  async getAdminContestById(contest_id: number): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: {
        ...this.contestSelectOption,
        visible: true,
        description: true,
        description_summary: true,
        is_rank_visible: true
      },
      rejectOnNotFound: () => new EntityNotExistException('Contest')
    })

    return contest
  }

  async getAdminContestsByGroupId(
    group_id: number
  ): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { group_id },
      select: { ...this.contestSelectOption, visible: true }
    })
  }

  async createContestToPublicRequest(
    userId: number,
    { contestId, message }: CreateContestToPublicRequestDto
  ): Promise<ContestToPublicRequest> {
    const request = await this.prisma.contestToPublicRequest.findFirst({
      where: {
        contest_id: contestId,
        request_status: { in: [RequestStatus.Accepted, RequestStatus.Pending] }
      }
    })

    if (request) {
      throw new ActionNotAllowedException(
        'This contest is already accepted or waits response'
      )
    }

    return await this.prisma.contestToPublicRequest.create({
      data: {
        message: message,
        contest: {
          connect: {
            id: contestId
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

  async deleteContestToPublicRequest(contestId: number, requestId: number) {
    const request = await this.prisma.contestToPublicRequest.findFirst({
      where: {
        id: requestId,
        contest_id: contestId
      },
      select: {
        request_status: true
      },
      rejectOnNotFound: () =>
        new EntityNotExistException('ContestToPublicRequest')
    })

    await this.deletePendingContestToPublicRequest(
      request.request_status,
      requestId
    )
  }

  async deletePendingContestToPublicRequest(
    requestStatus: RequestStatus,
    requestId: number
  ) {
    if (requestStatus != RequestStatus.Pending) {
      throw new ActionNotAllowedException(
        'Already responded request cannot be removed'
      )
    }

    await this.prisma.contestToPublicRequest.delete({
      where: {
        id: requestId
      }
    })
  }

  async getContestToPublicRequests(
    contestId: number
  ): Promise<Partial<ContestToPublicRequest>[]> {
    return await this.prisma.contestToPublicRequest.findMany({
      where: {
        contest_id: contestId
      },
      select: {
        id: true,
        request_status: true,
        created_by: {
          select: {
            username: true
          }
        },
        create_time: true
      }
    })
  }

  async getContestToPublicRequest(
    contestId: number,
    requestId: number
  ): Promise<Partial<ContestToPublicRequest>> {
    return await this.prisma.contestToPublicRequest.findFirst({
      where: {
        id: requestId,
        contest_id: contestId
      },
      select: {
        id: true,
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
    requestId: number,
    respondDto: RespondContestToPublicRequestDto
  ): Promise<ContestToPublicRequest> {
    const request = await this.prisma.contestToPublicRequest.findUnique({
      where: {
        id: requestId
      },
      select: {
        request_status: true,
        contest_id: true
      },
      rejectOnNotFound: () =>
        new EntityNotExistException('ContestToPublicRequest')
    })

    if (request.request_status != RequestStatus.Pending) {
      throw new ActionNotAllowedException('This request is already responded')
    }

    if (respondDto.requestStatus == RequestStatus.Accepted) {
      await this.updateContestIsPublic(request.contest_id, true)
    } else if (respondDto.requestStatus == RequestStatus.Rejected) {
      await this.updateContestIsPublic(request.contest_id, false)
    }

    return await this.prisma.contestToPublicRequest.update({
      where: {
        id: requestId
      },
      data: {
        request_status: respondDto.requestStatus
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
      RequestStatus.Accepted,
      RequestStatus.Rejected
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
        id: true,
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
    id: number
  ): Promise<Partial<ContestToPublicRequest>> {
    return await this.prisma.contestToPublicRequest.findUnique({
      where: {
        id
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
}
