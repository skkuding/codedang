import { Injectable } from '@nestjs/common'
import { Language, MandeuldangRunStatus, ToolType } from '@prisma/client'
import { MandeuldangAMQPService } from '@libs/amqp'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class MandeuldangPublicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpService: MandeuldangAMQPService
  ) {}

  async publishGeneratorMessage(
    problemId: number,
    requesterId: number,
    generatorArgs: string[],
    testCaseCount: number
  ) {
    //DB에서 generator, solution 조회
    const generator = await this.prisma.mandeuldangTool.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        problemId_toolType: {
          problemId,
          toolType: ToolType.Generator
        }
      }
    })

    const solution = await this.prisma.mandeuldangSolution.findUniqueOrThrow({
      where: { problemId }
    })

    const request = await this.prisma.mandeuldangRunRequest.create({
      data: {
        problemId,
        requesterId,
        toolType: ToolType.Generator,
        status: MandeuldangRunStatus.Pending
      }
    })

    const generatorRequest = {
      problemId,
      generatorLanguage: Language.Cpp,
      generatorCode: generator.fileContent,
      generatorArgs,
      solutionLanguage: solution.language,
      solutionCode: solution.fileContent,
      testCaseCount
    }
    //실행 요청 메시지 publish
    try {
      await this.amqpService.publishGeneratorMessage(
        request.id,
        problemId,
        generatorRequest
      )
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

    const validateRequest = {
      problemId,
      language: Language.Cpp,
      validatorCode: validator.fileContent
    }

    const request = await this.prisma.mandeuldangRunRequest.create({
      data: {
        problemId,
        requesterId,
        toolType: ToolType.Validator,
        status: MandeuldangRunStatus.Pending
      }
    })

    try {
      await this.amqpService.publishValidatorMessage(
        request.id,
        problemId,
        validateRequest
      )
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
