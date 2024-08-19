import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { Language, ResultStatus } from '@admin/@generated'
import type { GetContestSubmissionSummaryInput } from './model/get-contest-submission-summary.input'

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async getContestSubmissionSummaries(
    input: GetContestSubmissionSummaryInput,
    take: number,
    cursor: number | null
  ) {
    const pagenator = this.prisma.getPaginator(cursor)

    const { contestId, problemId } = input
    const contestSubmissions = await this.prisma.submission.findMany({
      ...pagenator,
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
        ip: c.userIp
      }
    })

    console.log(results)
    return results
  }
}
