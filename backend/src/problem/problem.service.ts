import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}
}
