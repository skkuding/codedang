import { Injectable, Scope } from '@nestjs/common'
import DataLoader from 'dataloader'
import { PrismaService } from '@libs/prisma'

@Injectable({ scope: Scope.REQUEST })
export class ContestLoader {
  constructor(private readonly prisma: PrismaService) {}

  batchParticipants = new DataLoader<number, number>(async (ids: number[]) => {
    console.log('ContestLoader batchParticipants', ids)

    const contests = await this.prisma.contest.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: {
            contestRecord: true
          }
        }
      }
    })

    const contestMap = new Map(
      contests.map((contest) => [contest.id, contest._count.contestRecord])
    )

    return ids.map((id) => {
      return contestMap.get(id) as number
    })
  })
}
