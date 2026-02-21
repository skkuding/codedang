import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class PolygonService {
  constructor(private readonly prisma: PrismaService) {}
}
