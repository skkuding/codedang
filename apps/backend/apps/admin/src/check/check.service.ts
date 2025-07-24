import type { HttpService } from '@nestjs/axios'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import { Span } from 'nestjs-otel'
import { EntityNotExistException } from '@libs/exception'
import type { PrismaService } from '@libs/prisma'
import type { CheckPublicationService } from './check-pub.service'
import type { CreatePlagiarismCheckDto } from './class/create-check.dto'

@Injectable()
export class CheckService {
  private readonly logger = new Logger(CheckService.name)
  private req: Request | undefined

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly publish: CheckPublicationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  @Span()
  async plagiarismCheckSubmissions({
    userId,
    checkDto,
    problemId
  }: {
    userId: number
    checkDto: CreatePlagiarismCheckDto
    problemId: number
  }) {
    const problem = await this.prisma.problem.findFirst({
      where: {
        id: problemId
      }
    })
    if (!problem) {
      throw new EntityNotExistException('Problem')
    }
  }
}
