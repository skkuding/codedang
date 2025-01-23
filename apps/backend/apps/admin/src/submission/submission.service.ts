import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { Language, ResultStatus } from '@admin/@generated'
import { Snippet } from '@admin/problem/model/template.input'
import { ContestSubmissionOrder } from './enum/contest-submission-order.enum'
import type { GetContestSubmissionsInput } from './model/get-contest-submission.input'

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async getContestSubmissions(
    input: GetContestSubmissionsInput,
    take: number,
    cursor: number | null,
    order: ContestSubmissionOrder | null
  ) {
    const paginator = this.prisma.getPaginator(cursor)

    const { contestId, problemId, searchingName } = input
    const contestSubmissions = await this.prisma.submission.findMany({
      ...paginator,
      take,
      where: {
        contestId,
        problemId,
        user: searchingName
          ? {
              userProfile: {
                realName: {
                  contains: searchingName,
                  mode: 'insensitive'
                }
              }
            }
          : undefined
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
            title: true,
            contestProblem: {
              where: {
                contestId,
                problemId
              }
            }
          }
        }
      },
      orderBy: order ? this.getOrderBy(order) : undefined
    })

    const results = contestSubmissions.map((c) => {
      return {
        title: c.problem.title,
        studentId: c.user?.studentId ?? 'Unknown',
        realname: c.user?.userProfile?.realName ?? 'Unknown',
        username: c.user?.username ?? 'Unknown',
        result: c.result as ResultStatus,
        language: c.language as Language,
        submissionTime: c.createTime,
        codeSize: c.codeSize ?? null,
        ip: c.userIp ?? 'Unknown',
        id: c.id,
        problemId: c.problemId,
        order: c.problem.contestProblem.length
          ? c.problem.contestProblem[0].order
          : null
      }
    })

    return results
  }

  getOrderBy(
    order: ContestSubmissionOrder
  ): Prisma.SubmissionOrderByWithRelationInput {
    const [sortKey, sortOrder] = order.split('-')

    switch (order) {
      case ContestSubmissionOrder.studentIdASC:
      case ContestSubmissionOrder.studentIdDESC:
      case ContestSubmissionOrder.usernameASC:
      case ContestSubmissionOrder.usernameDESC:
        return {
          user: {
            [sortKey]: sortOrder
          }
        }
      case ContestSubmissionOrder.realNameASC:
      case ContestSubmissionOrder.realNameDESC:
        return {
          user: {
            userProfile: {
              [sortKey]: sortOrder
            }
          }
        }
    }
  }

  async getSubmission(id: number) {
    const submission = await this.prisma.submission.findFirst({
      where: {
        id
      },
      include: {
        user: {
          include: {
            userProfile: true
          }
        },
        problem: true,
        contest: true,
        submissionResult: true
      }
    })
    if (!submission) {
      throw new EntityNotExistException('Submission')
    }
    const code = plainToInstance(Snippet, submission.code)
    const results = submission.submissionResult.map((result) => {
      return {
        ...result,
        cpuTime:
          result.cpuTime || result.cpuTime === BigInt(0)
            ? result.cpuTime.toString()
            : null
      }
    })
    results.sort((a, b) => a.problemTestcaseId - b.problemTestcaseId)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { submissionResult, ...submissionWithoutResult } = submission

    return {
      ...submissionWithoutResult,
      code: code.map((snippet) => snippet.text).join('\n'),
      testcaseResult: results
    }
  }
}
