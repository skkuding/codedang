import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserRole(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true
      }
    })
  }

  async getUserCredential(username: string) {
    return this.prisma.user.findUnique({
      where: { username }
    })
  }
}
