import { Injectable, NotFoundException } from '@nestjs/common'
import type { Announcement } from '@prisma/client'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async getProblemAnnouncements(
    _cursor: Date | number,
    take: number,
    problemId: number,
    groupId: number
  ): Promise<Partial<Announcement>[]> {
    let skip = 1
    let cursor = 0

    if (_cursor instanceof Date)
      cursor = (
        await this.prisma.announcement.findFirstOrThrow({
          where: {
            updateTime: {
              gte: _cursor as Date
            }
          }
        })
      ).id
    else cursor = _cursor

    if (cursor === 0) {
      cursor = 1
      skip = 0
    }

    const result = await this.prisma.announcement.findMany({
      cursor: {
        id: cursor
      },
      skip: skip,
      take: take,
      where: {
        problem: {
          id: problemId,
          groupId
        }
      },
      orderBy: { updateTime: 'desc' }
    })

    if (!result) {
      throw new NotFoundException('no corresponding announcement')
    }

    return result
  }

  async getContestAnnouncements(
    _cursor: Date | number,
    take: number,
    contestId: number,
    groupId: number
  ): Promise<Partial<Announcement>[]> {
    let skip = 1
    let cursor = 0

    if (_cursor instanceof Date)
      cursor = (
        await this.prisma.announcement.findFirstOrThrow({
          where: {
            updateTime: {
              gte: _cursor as Date
            }
          }
        })
      ).id
    else cursor = _cursor

    if (cursor === 0) {
      cursor = 1
      skip = 0
    }

    const result = await this.prisma.announcement.findMany({
      cursor: {
        id: cursor
      },
      skip,
      take,
      where: {
        problem: {
          contestProblem: {
            every: {
              contestId
            }
          },
          groupId
        }
      },
      orderBy: { updateTime: 'desc' }
    })

    if (!result) {
      throw new NotFoundException('no corresponding announcement')
    }

    return result
  }
}
