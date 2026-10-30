import { Injectable } from '@nestjs/common'
import { Language, ToolType } from '@prisma/client'
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
    await this.amqpService.publishGeneratorMessage(problemId, generatorRequest)
  }

  async publishValidatorMessage(problemId: number) {
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
    await this.amqpService.publishValidatorMessage(problemId, validateRequest)
  }
}
