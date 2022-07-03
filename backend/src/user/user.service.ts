import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserCredential(username: string) {
    return this.prisma.user.findUnique({
      where: { username }
    })
  }
}
