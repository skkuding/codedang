import { Injectable } from '@nestjs/common'
import { Language, MandeuldangRunStatus, ToolType } from '@prisma/client'
import { MandeuldangAMQPService } from '@libs/amqp'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'

@Injectable()
export class MandeuldangPublicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpService: MandeuldangAMQPService,
    private readonly storageService: StorageService
  ) {}

  async publishGeneratorMessage(
    problemId: number,
    requesterId: number,
    generatorArgs: string[],
    testcaseCount: number
  ) {
    //DB에서 generator, solution 조회
    const [generator, solution] = await Promise.all([
      this.prisma.mandeuldangTool.findUniqueOrThrow({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          problemId_toolType: { problemId, toolType: ToolType.Generator }
        }
      }),
      this.prisma.mandeuldangSolution.findUniqueOrThrow({
        where: { problemId }
      })
    ])

    const [generatorCode, solutionCode] = await Promise.all([
      this.storageService.readObject(generator.filePath, 'mandeuldang'),
      this.storageService.readObject(solution.filePath, 'mandeuldang')
    ])

    const request = await this.prisma.mandeuldangRunRequest.create({
      data: {
        problemId,
        requesterId,
        toolType: ToolType.Generator,
        status: MandeuldangRunStatus.Pending
      }
    })

    //실행 요청 메시지 publish
    try {
      await this.amqpService.publishGeneratorMessage({
        requestId: request.id,
        problemId,
        generatorLanguage: Language.Cpp,
        generatorCode,
        generatorArgs,
        solutionLanguage: solution.language,
        solutionCode,
        testcaseCount
      })
    } catch (error) {
      await this.prisma.mandeuldangRunRequest.update({
        where: { id: request.id },
        data: { status: MandeuldangRunStatus.Failed, completedAt: new Date() }
      })
      throw error
    }

    return request
  }

  async publishValidatorMessage(problemId: number, requesterId: number) {
    const validator = await this.prisma.mandeuldangTool.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        problemId_toolType: { problemId, toolType: ToolType.Validator }
      }
    })

    const validatorCode = await this.storageService.readObject(
      validator.filePath,
      'mandeuldang'
    )

    const request = await this.prisma.mandeuldangRunRequest.create({
      data: {
        problemId,
        requesterId,
        toolType: ToolType.Validator,
        status: MandeuldangRunStatus.Pending
      }
    })

    try {
      await this.amqpService.publishValidatorMessage({
        requestId: request.id,
        problemId,
        language: Language.Cpp,
        validatorCode
      })
    } catch (error) {
      await this.prisma.mandeuldangRunRequest.update({
        where: { id: request.id },
        data: { status: MandeuldangRunStatus.Failed, completedAt: new Date() }
      })
      throw error
    }

    return request
  }
}
