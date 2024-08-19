import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { Language, ResultStatus } from '@admin/@generated'
import type { GetContestSubmissionOverallInput } from './model/get-contest-submission-overall.input'

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async getContestSubmissionOveralls(
    input: GetContestSubmissionOverallInput,
    take: number,
    cursor: number | null
  ) {
    const paginator = this.prisma.getPaginator(cursor)

    const { contestId, problemId } = input
    const contestSubmissions = await this.prisma.submission.findMany({
      ...paginator,
      take,
      where: {
        contestId,
        problemId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            studentId: true,
            userProfile: {
              select: {
                realName: true
              }
            }
          }
        },
        problem: {
          select: {
            title: true
          }
        }
      }
    })

    const results = contestSubmissions.map((c) => {
      return {
        title: c.problem.title,
        studentId: c.user?.studentId as string,
        realname: c.user?.userProfile?.realName as string,
        username: c.user?.username as string,
        result: c.result as ResultStatus,
        language: c.language as Language,
        submissionTime: c.createTime,
        codeSize: c.codeSize ?? null,
        ip: c.userIp ?? 'Unknown'
      }
    })

    return results
  }
}
