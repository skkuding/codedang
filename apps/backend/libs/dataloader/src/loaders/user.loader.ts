import { Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { PrismaService } from '@libs/prisma'
import type { User } from '@admin/@generated'

@Injectable()
export class UserLoader {
  constructor(private readonly prisma: PrismaService) {}

  generateDataLoader(): DataLoader<number, User | null> {
    return new DataLoader(async (ids: number[]) => {
      const users = await this.prisma.user.findMany({
        where: { id: { in: ids } }
      })
      const userMap = new Map(users.map((user) => [user.id, user]))
      return ids.map((id) => userMap.get(id) ?? null)
    })
  }
}
