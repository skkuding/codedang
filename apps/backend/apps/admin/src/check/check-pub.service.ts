import { Injectable } from '@nestjs/common'
import type { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import type { TraceService } from 'nestjs-otel'
import type { PrismaService } from '@libs/prisma'

@Injectable()
export class CheckPublicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,
    private readonly traceService: TraceService
  ) {}
}
