import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { CheckResultStatus } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { validateOrReject, ValidationError } from 'class-validator'
import { Span } from 'nestjs-otel'
import { CheckAMQPService } from '@libs/amqp'
import { CheckStatus } from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { FileService } from './file.service'
import { CheckResponseMsg } from './model/check-response.dto'
import { Cluster, Comparison } from './model/check-result.dto'

@Injectable()
export class CheckSubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(CheckSubscriptionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpService: CheckAMQPService,
    private readonly fileService: FileService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  onModuleInit() {
    this.amqpService.setMessageHandlers({
      onCheckMessage: async (msg: object) => {
        try {
          this.logger.debug(msg, 'Received Check Result Message')
          const res = await this.validateCheckResponse(msg)
          await this.handleCheckMessage(res)
        } catch (error) {
          if (
            Array.isArray(error) &&
            error.every((e) => e instanceof ValidationError)
          ) {
            this.logger.error(
              JSON.stringify(error, null, 2),
              'Message format error'
            )
          } else if (error instanceof UnprocessableDataException) {
            this.logger.error(error, 'Iris exception')
          } else {
            this.logger.error(error, 'Unexpected error')
          }
          throw error // MQTT 서비스에서 Nack 처리
        }
      }
    })
    this.amqpService.startSubscription()
  }

  @Span()
  async validateCheckResponse(msg: object): Promise<CheckResponseMsg> {
    const res: CheckResponseMsg = plainToInstance(CheckResponseMsg, msg)
    await validateOrReject(res)

    return res
  }

  @Span()
  async handleCheckMessage(msg: CheckResponseMsg): Promise<void> {
    const status = CheckStatus(msg.resultCode)

    if (
      status === CheckResultStatus.ServerError ||
      status === CheckResultStatus.TokenError ||
      status === CheckResultStatus.JplagError
    ) {
      await this.handleCheckError(status, msg)
      return
    }

    const clusters = await this.fileService.getClustersFile(msg.checkId)

    const clusterConnections = await this.createClusters(clusters)

    const comparisons = await this.fileService.getComparisonsFile(msg.checkId)

    await this.createCheckResults(msg.checkId, comparisons, clusterConnections)

    await this.prisma.checkRequest.update({
      where: {
        id: msg.checkId
      },
      data: {
        result: CheckResultStatus.Completed
      }
    })

    //await this.fileService.clearFiles(msg.checkId)
  }

  @Span()
  async handleCheckError(
    status: CheckResultStatus,
    msg: CheckResponseMsg
  ): Promise<void> {
    const checkRequest = await this.prisma.checkRequest.findUnique({
      where: {
        id: msg.checkId,
        result: CheckResultStatus.Pending
      },
      select: {
        id: true
      }
    })

    if (!checkRequest) return

    await this.prisma.checkRequest.update({
      where: {
        id: msg.checkId
      },
      data: {
        result: status
      }
    })

    if (status === CheckResultStatus.ServerError)
      throw new UnprocessableDataException(`${msg.checkId} ${msg.error}`)
  }

  @Span()
  async createClusters(clusters: Cluster[]): Promise<
    {
      clusterId: number
      memberIds: number[]
    }[]
  > {
    return await Promise.all(
      clusters.map(async (cluster) => {
        const clusterId = await this.prisma.plagiarismCluster.create({
          data: {
            averageSimilarity: cluster.averageSimilarity,
            strength: cluster.strength
          },
          select: {
            id: true
          }
        })

        cluster.members.forEach(async (memberId) => {
          await this.prisma.submissionCluster.create({
            data: {
              submissionId: memberId,
              clusterId: clusterId.id
            }
          })
        })

        return {
          clusterId: clusterId.id,
          memberIds: cluster.members
        }
      })
    )
  }

  @Span()
  async createCheckResults(
    checkId: number,
    comparisons: Comparison[],
    clusterConnections: {
      clusterId: number
      memberIds: number[]
    }[]
  ): Promise<void> {
    await this.prisma.checkResult.createMany({
      data: comparisons.map((comparison) => {
        const clusterConnection = clusterConnections.filter((conn) => {
          return (
            conn.memberIds.includes(comparison.firstSubmissionId) &&
            conn.memberIds.includes(comparison.secondSubmissionId)
          )
        })

        if (clusterConnection.length > 1) {
          throw new UnprocessableDataException(
            'more than one cluster has duplicate comparison.'
          )
        }

        const clusterId =
          clusterConnection.length == 0 ? null : clusterConnection[0].clusterId

        return {
          requestId: checkId,
          firstCheckSubmissionId: comparison.firstSubmissionId,
          secondCheckSubmissionId: comparison.secondSubmissionId,
          averageSimilarity: comparison.similarities.AVG,
          maxSimilarity: comparison.similarities.MAX,
          maxLength: comparison.similarities.MAXIMUMLENGTH,
          longestMatch: comparison.similarities.LONGESTMATCH,
          matches: comparison.matches.map((match) => JSON.stringify(match)),
          firstSimilarity: comparison.firstSimilarity,
          secondSimilarity: comparison.secondSimilarity,
          clusterId
        }
      })
    })
  }
}
