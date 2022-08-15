import { Injectable } from '@nestjs/common'
import { UnprocessableDataException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreatePublicProblemSubmissionDto } from './dto/createPublicProblemSubmission.dto'

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async createPublicProblemSubmission(
    userId: number,
    ip: string,
    createPublicProblemSubmissionDto: CreatePublicProblemSubmissionDto
  ) {
    //TODO: use problem repository(is_public=true, group_id=1)
    const { languages } = await this.prisma.problem.findUnique({
      where: { id: createPublicProblemSubmissionDto.problemId },
      select: { languages: true }
    })

    if (!languages.includes(createPublicProblemSubmissionDto.language)) {
      throw new UnprocessableDataException(
        `${createPublicProblemSubmissionDto.language} is not allowed`
      )
    }

    const submission = this.prisma.submission.create({
      data: {
        user: {
          connect: { id: userId }
        },
        problem: {
          connect: { id: createPublicProblemSubmissionDto.problemId }
        },
        code: createPublicProblemSubmissionDto.code,
        language: createPublicProblemSubmissionDto.language,
        ip_addr: ip
      }
    })

    return submission
  }
}
