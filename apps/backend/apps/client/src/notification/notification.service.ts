import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}
}
