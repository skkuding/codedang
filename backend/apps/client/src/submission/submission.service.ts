import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}
}
