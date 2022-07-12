import { Injectable } from '@nestjs/common'
import { Contest } from '@prisma/client'
import {
  EntityNotExistException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { PrismaService } from '../prisma/prisma.service'

const PUBLIC = 1

function returnTextIsNotAllowed(user_id: number, contest_id: number): string {
  return `Contest ${contest_id} is not allowed to user ${user_id}`
}

const contestListselectOption = {
  id: true,
  title: true,
  description: true,
  start_time: true,
  end_time: true,
  visible: true,
  group_id: true,
  type: true
}
const userContestListPageOption = {
  where: { visible: true },
  select: contestListselectOption
}

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

  filterOngoing(allContest) {
    const now = new Date()
    const ongoingContest = allContest.filter(
      (contest) => contest.start_time <= now && contest.end_time > now
    )
    return ongoingContest
  }

  /* public */
  async getOngoingContests(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    return this.filterOngoing(allContest)
  }

  async getUpcomingContests(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    const returnContest = allContest.filter(
      (contest) => contest.start_time > new Date()
    )
    return returnContest
  }

  async getFinishedContests(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    const returnContest = allContest.filter(
      (contest) => contest.end_time <= new Date()
    )
    return returnContest
  }
  // Todo: check select option
  async getContestById(
    user_id: number,
    contest_id: number
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: contestListselectOption
    })
    if (!contest) {
      throw new EntityNotExistException(`contest ${contest_id}`)
    }
    const isUserInGroup = await this.prisma.userGroup.findFirst({
      where: { user_id, group_id: contest.group_id, is_registered: true },
      select: { is_group_manager: true }
    })
    if (
      (!isUserInGroup && contest.end_time > new Date()) ||
      (contest.visible == false && isUserInGroup.is_group_manager == false)
    ) {
      throw new InvalidUserException(
        returnTextIsNotAllowed(user_id, contest_id)
      )
    }
    return contest
  }

  // Todo: issue #90
  async createContestRecord(
    user_id: number,
    contest_id: number
  ): Promise<null | Error> {
    //중복 참여 확인 in contestRecord
    const isAlreadyRecord = await this.prisma.contestRecord.findFirst({
      where: { user_id, contest_id },
      select: { id: true }
    })
    if (isAlreadyRecord) {
      throw new InvalidUserException(
        `User ${user_id} is already participated in contest ${contest_id}`
      )
    }
    //contest group 확인
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: { group_id: true, start_time: true, end_time: true, type: true }
    })
    //contest private여부 확인
    if (contest.group_id !== PUBLIC) {
      //user group인지 확인
      const isUserInGroup = await this.prisma.userGroup.findFirst({
        where: { user_id, group_id: contest.group_id, is_registered: true },
        select: { id: true }
      })
      if (!isUserInGroup) {
        throw new InvalidUserException(
          returnTextIsNotAllowed(user_id, contest_id)
        )
      }
    }
    //contest start 전 or contest end 후 -> throw
    const now = new Date()
    if (now < contest.start_time || now >= contest.end_time) {
      throw new InvalidUserException(
        returnTextIsNotAllowed(user_id, contest_id)
      )
    }
    //contest type ACM -> create contest rank acm record
    if (contest.type === 'ACM') {
      await this.prisma.contestRankACM.create({
        data: { contest_id, user_id }
      })
    }
    //general -> create contest record
    // Todo: check rank initial value
    await this.prisma.contestRecord.create({
      data: { contest_id, user_id, rank: 0 }
    })
    return
  }

  /* group */
  async getContestsByGroupId(user_id: number, group_id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: group_id }
    })
    if (!group) {
      throw new EntityNotExistException(`group ${group_id}`)
    }
    return await this.prisma.userGroup.findFirst({
      where: { user_id, group_id, is_registered: true },
      select: {
        group: {
          select: {
            Contest: {
              where: { group_id, visible: true },
              select: contestListselectOption
            }
          }
        }
      }
    })
  }

  /* admin */
  async getAdminContests(user_id: number) {
    return await this.prisma.userGroup.findFirst({
      where: { user_id, is_group_manager: true },
      select: { group: { select: { group_name: true, Contest: true } } }
    })
  }
  async getAdminOngoingContests(user_id: number) {
    const allContest = await this.getAdminContests(user_id)
    return this.filterOngoing(allContest)
  }

  // Todo: check select option
  async getAdminContestById(
    user_id: number,
    contest_id: number
  ): Promise<Partial<Contest>> {
    // 뒤에서 contest db 너무 들고오길래 처음에 contest id만 가져와서 확인하게 해둠
    const contestGroupId = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: { group_id: true }
    })

    if (!contestGroupId) {
      throw new EntityNotExistException(`contest ${contest_id}`)
    }
    const isUserInGroup = await this.prisma.userGroup.findFirst({
      where: {
        user_id,
        group_id: contestGroupId.group_id,
        is_group_manager: true
      },
      select: { is_group_manager: true }
    })
    if (!isUserInGroup) {
      throw new InvalidUserException(
        returnTextIsNotAllowed(user_id, contest_id)
      )
    }

    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: {
        title: true,
        // Todo: notice list (add display id)
        ContestNotice: {
          select: {
            id: true,
            title: true,
            update_time: true
            //,display_id: true
          }
        },
        // problem list
        ContestProblem: {
          select: {
            problem: {
              select: { title: true, difficulty: true, update_time: true }
            }
          }
        },
        // Todo: submission list (add student id)
        Submission: {
          select: {
            create_time: true, // == submission time
            user: true, // user : {select: {student_id:true}}
            problem: {
              select: { title: true, source: true }
            },
            language: true,
            SubmissionResult: true
          }
        }
      }
    })
    return contest
  }
}
