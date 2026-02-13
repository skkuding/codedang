import { Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import * as archiver from 'archiver'
import { plainToInstance } from 'class-transformer'
import { createWriteStream, existsSync } from 'fs'
import { writeFile, rm, unlink, mkdir } from 'fs/promises'
import * as os from 'os'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { AuthenticatedUser } from '@libs/auth'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableFileDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  ContestRole,
  Role,
  type Language,
  type ResultStatus
} from '@admin/@generated'
import { Snippet } from '@admin/problem/model/template.input'
import { LanguageExtension } from './enum/language-extensions.enum'
import { SubmissionOrder } from './enum/submission-order.enum'
import type {
  GetAssignmentSubmissionsInput,
  GetContestSubmissionsInput
} from './model/get-submissions.input'
import type { SubmissionsWithTotal } from './model/submissions-with-total.output'

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name)
  constructor(private readonly prisma: PrismaService) {}

  async getSubmissions(
    problemId: number,
    cursor: number | null,
    take: number,
    reqUser: AuthenticatedUser
  ): Promise<SubmissionsWithTotal> {
    const paginator = this.prisma.getPaginator(cursor)

    const problem = await this.prisma.problem.findFirst({
      where: {
        id: problemId
      }
    })

    if (!problem) {
      throw new EntityNotExistException('Problem')
    }

    const hasPrivilege = reqUser.isAdmin() || reqUser.isSuperAdmin()

    // user가 관리하는 Group들과 Contest들을 병렬로 가져오기
    let accessibleGroupIds: number[] = []
    let accessibleContestIds: number[] = []

    // hasPrivilege가 false일 때만 쿼리 실행
    if (!hasPrivilege) {
      const [groups, contests] = await Promise.all([
        this.prisma.userGroup.findMany({
          where: {
            userId: reqUser.id,
            isGroupLeader: true
          },
          select: {
            groupId: true
          }
        }),
        this.prisma.userContest.findMany({
          where: {
            userId: reqUser.id,
            role: {
              in: [ContestRole.Admin, ContestRole.Manager]
            }
          },
          select: {
            contestId: true
          }
        })
      ])
      accessibleGroupIds = groups.map((g) => g.groupId)
      accessibleContestIds = contests.map((c) => c.contestId)
    }

    // 접근 가능한 submission들만 쿼리
    const whereCondition = hasPrivilege
      ? { problemId }
      : {
          problemId,
          OR: [
            { assignment: { groupId: { in: accessibleGroupIds } } },
            { contestId: { in: accessibleContestIds } }
          ]
        }

    const [submissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        ...paginator,
        take,
        where: whereCondition,
        include: {
          user: true
        },
        orderBy: [{ id: 'desc' }]
      }),
      this.prisma.submission.count({
        where: whereCondition
      })
    ])

    if (total === 0) {
      throw new ForbiddenAccessException(
        'Only allowed to access submissions included in your group'
      )
    }

    return { data: submissions, total }
  }

  async getContestSubmissions(
    contestId: number,
    input: GetContestSubmissionsInput,
    take: number,
    cursor: number | null,
    order: SubmissionOrder | null
  ) {
    const paginator = this.prisma.getPaginator(cursor)

    const { problemId, searchingName } = input
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

  /**
   * 특정 Assignment의 특정 Problem에 대한 제출 내역을 지정된 개수만큼 불러옵니다.
   *
   * @param {GetAssignmentSubmissionsInput} input 검색할 제출 내역의 정보
   * @param {number} take 가져올 제출 내역의 개수
   * @param {(number | null)} cursor Pagination을 위한 커서
   * @param {(SubmissionOrder | null)} order 검색 결과의 정렬 기준
   * @returns 찾은 제출 내역들을 반환합니다
   */
  async getAssignmentSubmissions(
    input: GetAssignmentSubmissionsInput,
    take: number,
    cursor: number | null,
    order: SubmissionOrder | null
  ) {
    const paginator = this.prisma.getPaginator(cursor)

    const { assignmentId, problemId, searchingName } = input
    const assignmentSubmissions = await this.prisma.submission.findMany({
      ...paginator,
      take,
      where: {
        assignmentId,
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
            assignmentProblem: {
              where: {
                assignmentId,
                problemId
              }
            }
          }
        }
      },
      orderBy: order ? this.getOrderBy(order) : undefined
    })

    const results = assignmentSubmissions.map((c) => {
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
        order: c.problem.assignmentProblem.length
          ? c.problem.assignmentProblem[0].order
          : null
      }
    })

    return results
  }

  async getAssignmentLatestSubmission(
    assignmentId: number,
    userId: number,
    problemId: number,
    reqUserId: number
  ) {
    const submissionId = await this.prisma.submission.findFirst({
      where: {
        assignmentId,
        userId,
        problemId
      },
      orderBy: { createTime: 'desc' },
      select: {
        id: true
      }
    })

    if (!submissionId) {
      throw new EntityNotExistException('Submission')
    }

    return this.getSubmission(submissionId.id, reqUserId)
  }

  async getAssignmentLatestSubmissionInfo(
    assignmentId: number,
    userId: number,
    problemId: number
  ) {
    const submissionInfo = await this.prisma.submission.findFirst({
      where: {
        assignmentId,
        userId,
        problemId
      },
      orderBy: { createTime: 'desc' },
      select: {
        id: true,
        code: true,
        updateTime: true,
        language: true,
        user: {
          select: {
            id: true,
            username: true,
            studentId: true
          }
        }
      }
    })

    if (!submissionInfo) {
      throw new EntityNotExistException('Submission')
    }

    return submissionInfo
  }

  async getAssignmentProblemTestcaseResults(
    assignmentId: number,
    problemId: number,
    groupId: number
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { groupId: true }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (assignment.groupId !== groupId) {
      throw new ForbiddenAccessException('Only allowed to access your course')
    }

    const latestSubmissions = await this.prisma.submission.groupBy({
      by: ['userId'],
      where: {
        assignmentId,
        problemId
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _max: {
        id: true
      }
    })

    const submissionIds = latestSubmissions
      .map((submission) => submission._max.id)
      .filter((id) => id !== null)

    if (submissionIds.length === 0) {
      throw new EntityNotExistException('Submission')
    }

    const detailedSubmissions = await this.prisma.submission.findMany({
      where: {
        id: { in: submissionIds }
      },
      select: {
        userId: true,
        submissionResult: {
          select: {
            problemTestcase: {
              select: {
                id: true,
                isHidden: true
              }
            },
            result: true
          }
        }
      }
    })

    const results = detailedSubmissions
      .filter((submission) => submission.userId !== null)
      .map((submission) => ({
        userId: submission.userId!,
        result: submission.submissionResult.map((sr) => ({
          id: sr.problemTestcase.id,
          isHidden: sr.problemTestcase.isHidden!,
          result: sr.result
        }))
      }))

    return results
  }

  getOrderBy(
    order: SubmissionOrder
  ): Prisma.SubmissionOrderByWithRelationInput {
    const [sortKey, sortOrder] = order.split('-')

    switch (order) {
      case SubmissionOrder.studentIdASC:
      case SubmissionOrder.studentIdDESC:
      case SubmissionOrder.usernameASC:
      case SubmissionOrder.usernameDESC:
        return {
          user: {
            [sortKey]: sortOrder
          }
        }
      case SubmissionOrder.realNameASC:
      case SubmissionOrder.realNameDESC:
        return {
          user: {
            userProfile: {
              [sortKey]: sortOrder
            }
          }
        }
    }
  }

  async getSubmission(id: number, userId: number) {
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
        assignment: true,
        // TODO: Let's not include this here.
        // Instead, we should use @ResolveField to get this value.
        submissionResult: {
          include: {
            problemTestcase: {
              select: {
                input: true,
                output: true,
                isHidden: true,
                scoreWeight: true,
                scoreWeightNumerator: true,
                scoreWeightDenominator: true
              }
            }
          }
        }
      }
    })
    if (!submission) {
      throw new EntityNotExistException('Submission')
    }

    if (submission.assignment) {
      const leaderGroupIds = (
        await this.prisma.userGroup.findMany({
          where: {
            userId,
            isGroupLeader: true
          },
          select: {
            groupId: true
          }
        })
      ).map((group) => group.groupId)

      if (
        !leaderGroupIds.includes(submission.assignment.groupId) &&
        userId !== submission.userId
      ) {
        throw new ForbiddenAccessException('Only allowed to access your course')
      }
    } else if (submission.contest) {
      const contestIds = (
        await this.prisma.userContest.findMany({
          where: {
            userId,
            role: {
              in: [ContestRole.Admin, ContestRole.Manager]
            }
          }
        })
      ).map((contest) => contest.contestId)

      if (!contestIds.includes(submission.contest.id)) {
        throw new ForbiddenAccessException(
          'Only allowed to access your contest'
        )
      }
    } else {
      const userRole = await this.prisma.user.findFirst({
        where: {
          id: userId
        },
        select: {
          role: true
        }
      })

      if (userRole?.role !== Role.Admin && userRole?.role !== Role.SuperAdmin) {
        throw new ForbiddenAccessException(
          'Only Admin can access this submission'
        )
      }
    }

    const code = plainToInstance(Snippet, submission.code)
    const results = submission.submissionResult.map((result) => {
      return {
        ...result,
        // TODO: Handle this separately.
        // If input/output is null, the values should be read from S3.
        problemTestcase: {
          input: result.problemTestcase.input ?? '',
          output: result.problemTestcase.output ?? ''
        },
        cpuTime:
          result.cpuTime || result.cpuTime === BigInt(0)
            ? result.cpuTime.toString()
            : null,
        isHidden: result.problemTestcase.isHidden,
        scoreWeight: result.problemTestcase.scoreWeight,
        scoreWeightNumerator: result.problemTestcase.scoreWeightNumerator,
        scoreWeightDenominator: result.problemTestcase.scoreWeightDenominator
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

  private async getAssignmentTitle(
    assignmentId: number
  ): Promise<string | null> {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assignmentId
      },
      select: {
        title: true
      }
    })
    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }
    if (assignment.title === '') {
      return `Assignment_${assignmentId}`
    }
    return assignment.title
  }

  private async getProblemTitle(problemId: number): Promise<string | null> {
    const problem = await this.prisma.problem.findUnique({
      where: {
        id: problemId
      },
      select: {
        title: true
      }
    })
    if (!problem) {
      throw new EntityNotExistException('Problem')
    }
    if (problem.title === '') {
      return `Problem_${problemId}`
    }
    return problem.title
  }

  private async compressSourceCodes(
    assignmentId: number,
    problemId: number
  ): Promise<{ zipPath: string; zipFilename: string; dirPath: string }> {
    const assignmentProblemRecords =
      await this.prisma.assignmentProblemRecord.findMany({
        where: {
          assignmentId,
          problemId,
          isSubmitted: true
        },
        select: {
          userId: true
        }
      })
    if (assignmentProblemRecords.length === 0) {
      throw new EntityNotExistException('AssignmentProblem')
    }
    const userIds = assignmentProblemRecords.map((r) => r.userId)
    const submissionInfos = await this.prisma.submission.findMany({
      where: {
        assignmentId,
        problemId,
        userId: { in: userIds }
      },
      distinct: ['userId'],
      orderBy: { createTime: 'desc' },
      select: {
        id: true,
        code: true,
        updateTime: true,
        language: true,
        user: {
          select: {
            id: true,
            username: true,
            studentId: true
          }
        }
      }
    })
    if (submissionInfos.length === 0) {
      throw new EntityNotExistException('Submission')
    }

    const problem = await this.prisma.problem.findFirst({
      where: {
        id: problemId
      },
      select: {
        title: true
      }
    })
    if (!problem) {
      throw new EntityNotExistException('Problem')
    }

    const problemTitle = problem!.title ?? `Problem_${problemId}`
    const assignmentTitle = await this.getAssignmentTitle(assignmentId)
    const uniqueId = uuidv4()
    const dirPath = path.join(os.tmpdir(), `submissions_${uniqueId}`)
    const zipPath = `${dirPath}.zip`
    const zipFilename = `${assignmentTitle}_${problemId}.zip`
    try {
      await mkdir(dirPath, { recursive: true })
      await Promise.all(
        submissionInfos.map(async (info) => {
          const code = plainToInstance(Snippet, info.code)
          const formattedCode = code.map((snippet) => snippet.text).join('\n')
          const filename = `${info.user?.studentId}${LanguageExtension[info.language]}`
          await writeFile(path.join(dirPath, filename), formattedCode)
        })
      )

      await new Promise<void>((resolve, reject) => {
        const output = createWriteStream(zipPath)
        const archive = archiver.create('zip', { zlib: { level: 9 } })

        archive.on('error', reject)
        output.on('close', resolve)
        output.on('error', reject)

        archive.pipe(output)
        archive.directory(dirPath, problemTitle!)
        archive.finalize()
      })

      return { zipPath, zipFilename, dirPath }
    } catch (err) {
      if (existsSync(zipPath)) {
        await unlink(zipPath)
      }
      if (existsSync(dirPath)) {
        await rm(dirPath, { recursive: true, force: true })
      }
      throw new UnprocessableFileDataException(
        'Failed to write source code files',
        err
      )
    }
  }

  async downloadSourceCodes(
    assignmentId: number,
    problemId: number,
    userId: number
  ) {
    const assignmentGroup = await this.prisma.assignment.findFirst({
      where: {
        id: assignmentId
      },
      select: {
        groupId: true,
        title: true
      }
    })
    if (!assignmentGroup) {
      throw new EntityNotExistException('Assignment')
    }

    const user = await this.prisma.user.findFirst({
      select: {
        role: true,
        userGroup: {
          where: {
            isGroupLeader: true,
            groupId: assignmentGroup.groupId
          },
          select: {
            groupId: true
          }
        }
      },
      where: {
        id: userId
      }
    })

    const isAdmin = user?.role === Role.Admin || user?.role === Role.SuperAdmin
    const isGroupLeader = (user?.userGroup?.length ?? 0) > 0

    if (!isAdmin && !isGroupLeader) {
      throw new ForbiddenAccessException(
        'Only Group Leader can download source codes.'
      )
    }

    const compressed = await this.compressSourceCodes(assignmentId, problemId)
    return compressed
  }
}
