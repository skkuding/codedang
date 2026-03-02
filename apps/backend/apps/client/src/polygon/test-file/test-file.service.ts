import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class TestFileService {
  constructor(private readonly prisma: PrismaService) {}
}
