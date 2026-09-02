import { Injectable, Logger } from '@nestjs/common'
import { Prisma, ResultStatus as PrismaResultStatus } from '@prisma/client'
import * as archiver from 'archiver'
import { plainToInstance } from 'class-transformer'
import { Response } from 'express'
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  rm,
  unlink,
  writeFile
} from 'fs'
import path from 'path'
import sanitize from 'sanitize-filename'
import { JudgeAMQPService } from '@libs/amqp'
import type { AuthenticatedUser } from '@libs/auth'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableFileDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { ContestRole, Language, ResultStatus, Role } from '@admin/@generated'
import { Snippet } from '@admin/problem/model/template.input'
import { JudgeRequest } from '@client/submission/class/judge-request'
import { LanguageExtension } from './enum/language-extensions.enum'
import { SubmissionOrder } from './enum/submission-order.enum'
import type {
  GetAssignmentSubmissionsInput,
  GetContestSubmissionsInput
} from './model/get-submissions.input'
import { RejudgeResult } from './model/rejudge-result.output'
import { RejudgeInput, RejudgeMode } from './model/rejudge.input'
import type { SubmissionCountByLanguage } from './model/submission-counts-by-language.output'
import type { SubmissionResultOutput } from './model/submission-result.model'
import type { SubmissionsWithTotal } from './model/submissions-with-total.output'

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpService: JudgeAMQPService
  ) {}

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
      orderBy: [{ createTime: 'desc' }, { id: 'desc' }],
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
      orderBy: [{ createTime: 'desc' }, { id: 'desc' }],
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

  /**
   * 특정 과제의 특정 문제에 대해 각 사용자의 최신 제출물을 기준으로 언어별 제출 통계를 계산합니다.
   * @param assignmentId 조회의 대상이 되는 AssignmentId
   * @param problemId 조회의 대상이 되는 ProblemId
   * @param groupId 해당 과제가 속한 그룹의 Id (그룹 리더 가드에서 사용)
   * @param reqUser 요청을 보낸 사용자 정보 (권한 검증 시 사용)
   * @returns 언어별 제출 횟수가 담긴 SubmissionCountByLanguage 배열
   * @throws {EntityNotExistException} 요청한 과제가 존재하지 않을 때
   * @throws {ForbiddenAccessException} 사용자의 권한 검증에 실패 했을 때 (Admin, SuperAdmin이 아니거나 해당 그룹의 리더가 아닐 경우)
   */
  async getLatestSubmissionCountByLanguage(
    assignmentId: number,
    problemId: number,
    groupId: number,
    reqUser: AuthenticatedUser
  ): Promise<SubmissionCountByLanguage[]> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { groupId: true }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    const hasPrivilege = reqUser.isAdmin() || reqUser.isSuperAdmin()

    if (!hasPrivilege) {
      const isGroupLeader = await this.prisma.userGroup.findFirst({
        where: {
          userId: reqUser.id,
          groupId: assignment.groupId,
          isGroupLeader: true
        }
      })

      if (!isGroupLeader) {
        throw new ForbiddenAccessException(
          'Only group leaders can access the assignment'
        )
      }
    }

    const submissions = await this.prisma.submission.findMany({
      where: {
        assignmentId,
        problemId
      },
      distinct: ['userId'],
      orderBy: {
        id: 'desc'
      },
      select: {
        language: true
      }
    })

    const countMap = new Map<Language, number>()
    Object.values(Language).forEach((lang) => {
      countMap.set(lang, 0)
    })

    for (const submission of submissions) {
      const lang = submission.language as Language
      const currentCount = countMap.get(lang)
      countMap.set(lang, (currentCount ?? 0) + 1)
    }

    return Array.from(countMap, ([language, count]) => ({
      language,
      count
    }))
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

  async getAssignmentTitle(assignmentId: number): Promise<string | null> {
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
    return encodeURIComponent(assignment.title)
  }

  async getProblemTitle(problemId: number): Promise<string | null> {
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
    return encodeURIComponent(problem.title)
  }

  async getSubmissionResult(
    submissionId: number,
    testcaseId: number,
    reqUser: AuthenticatedUser
  ): Promise<SubmissionResultOutput> {
    const hasPrivilege = reqUser.isAdmin() || reqUser.isSuperAdmin()

    if (!hasPrivilege) {
      const submission = await this.prisma.submission.findFirst({
        where: {
          id: submissionId
        },
        select: {
          assignment: {
            select: { groupId: true }
          },
          contestId: true
        }
      })

      if (!submission) throw new EntityNotExistException('Submission')

      if (submission.assignment) {
        const isGroupLeader = await this.prisma.userGroup.findFirst({
          where: {
            groupId: submission.assignment.groupId,
            userId: reqUser.id,
            isGroupLeader: true
          }
        })

        if (!isGroupLeader)
          throw new ForbiddenAccessException(
            `Only allowed to access submissions included in your group`
          )
      } else if (submission.contestId) {
        const isContestManager = await this.prisma.userContest.findFirst({
          where: {
            contestId: submission.contestId,
            userId: reqUser.id,
            role: {
              not: ContestRole.Participant
            }
          }
        })

        if (!isContestManager)
          throw new ForbiddenAccessException(
            `Only allowed to access your contest`
          )
      }
    }

    const submissionResult = await this.prisma.submissionResult.findFirst({
      where: {
        submissionId,
        problemTestcaseId: testcaseId
      }
    })

    if (!submissionResult) throw new EntityNotExistException('SubmissionResult')

    return {
      ...submissionResult,
      cpuTime:
        submissionResult.cpuTime || submissionResult.cpuTime === BigInt(0)
          ? submissionResult.cpuTime.toString()
          : null
    }
  }

  async compressSourceCodes(assignmentId: number, problemId: number) {
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

    const submissionInfos = await Promise.all(
      assignmentProblemRecords.map(async (record) => {
        const submissionInfo = await this.getAssignmentLatestSubmissionInfo(
          assignmentId,
          record.userId,
          problemId
        )
        return submissionInfo
      })
    )

    if (submissionInfos.length === 0) {
      throw new EntityNotExistException('Submssion')
    }

    const problemTitle = await this.getProblemTitle(problemId)
    const assignmentTitle = await this.getAssignmentTitle(assignmentId)

    const dirPath = path.join(__dirname, `${assignmentTitle!}_${problemId}`)
    mkdirSync(dirPath, { recursive: true })

    submissionInfos.forEach((info) => {
      const code = plainToInstance(Snippet, info.code)
      const formattedCode = code.map((snippet) => snippet.text).join('\n')
      const filename = `${info.user?.studentId}${LanguageExtension[info.language]}`
      const filePath = path.join(dirPath, filename)
      writeFile(filePath, formattedCode, (err) => {
        if (err) {
          this.logger.error(err)
          throw new UnprocessableFileDataException(
            'Failed to handle source code file',
            filename
          )
        }
      })
    })
    const zipFilename = `${assignmentTitle}_${problemId}`
    const zipPath = path.join(__dirname, `${zipFilename}.zip`)
    const output = createWriteStream(zipPath)
    const archive = archiver.create('zip', { zlib: { level: 9 } })

    archive.on('error', (err) => {
      this.logger.error(err)
      output.end()
    })
    archive.pipe(output)
    archive.directory(dirPath, problemTitle!)

    await archive.finalize().catch((err) => {
      this.logger.error(`Finalization failed: ${err}`)
      output.end()
      throw new UnprocessableFileDataException(
        'Failed to create zip file',
        zipFilename
      )
    })

    const downloadSrc = `/submission/download/${zipFilename}`
    return downloadSrc
  }

  async downloadCodes(filename: string, res: Response) {
    const sanitizedFilename = sanitize(filename)
    const encodedFilename = encodeURIComponent(sanitizedFilename)
    const zipFilename = path.resolve(__dirname, encodedFilename)
    if (
      !zipFilename.startsWith(__dirname) ||
      !existsSync(`${zipFilename}.zip`)
    ) {
      res.status(404).json({ error: 'File not found' })
    }

    res.set({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/zip',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}.zip`
    })
    const fileStream = createReadStream(`${zipFilename}.zip`)
    fileStream.pipe(res)

    fileStream.on('close', () => {
      unlink(`${zipFilename}.zip`, (err) => {
        if (err) this.logger.error('Error on deleting file: ', err)
      })
      rm(zipFilename, { recursive: true, force: true }, (err) => {
        if (err) this.logger.error('Error on deleting folder: ', err)
      })
      res.end()
    })
    fileStream.on('error', () => {
      unlink(`${zipFilename}.zip`, (err) => {
        if (err) this.logger.error('Error on deleting file: ', err)
      })
      rm(zipFilename, { recursive: true, force: true }, (err) => {
        if (err) this.logger.error('Error on deleting folder: ', err)
      })
      res.status(500).json({ error: 'File download failed' })
    })
  }

  /**
   * 특정 Assignment의 특정 Problem에 대한 모든 제출을 재채점합니다.
   *
   * @param input 재채점 옵션 (assignmentId, problemId, mode)
   * @param reqUser 요청한 사용자
   * @returns 재채점 결과
   */
  async rejudgeAssignmentProblem(
    input: RejudgeInput,
    reqUser: AuthenticatedUser
  ): Promise<RejudgeResult> {
    const { assignmentId, problemId, mode } = input

    // 권한 검증 및 기본 데이터 조회
    const { problem } = await this.validateAndFetchRejudgeData(
      assignmentId,
      problemId,
      reqUser
    )

    // 제출 조회 및 필터링
    const allSubmissions = await this.fetchSubmissionsForRejudge(
      assignmentId,
      problemId
    )
    const latestSubmissions =
      this.filterLatestSubmissionsPerUser(allSubmissions)

    if (latestSubmissions.length === 0) {
      return this.createEmptyRejudgeResult(allSubmissions.length)
    }

    // 모드에 따라 재채점 준비
    const submissionsToJudge = await this.prepareSubmissionsForRejudge(
      latestSubmissions,
      problem,
      assignmentId,
      mode
    )

    // 채점 요청 발행
    const processedCount = await this.publishJudgeRequests(
      submissionsToJudge,
      problem
    )

    return this.createRejudgeResult(allSubmissions.length, processedCount, mode)
  }

  /**
   * 문제 조회, Assignment 조회, 권한 검증 및 기본 데이터 조회
   */
  private async validateAndFetchRejudgeData(
    assignmentId: number,
    problemId: number,
    reqUser: AuthenticatedUser
  ) {
    const [assignment, problem] = await Promise.all([
      this.prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: { id: true, groupId: true, title: true }
      }),
      this.prisma.problem.findUnique({
        where: { id: problemId },
        select: { id: true, title: true, timeLimit: true, memoryLimit: true }
      })
    ])

    if (!assignment || !problem) {
      throw new EntityNotExistException('Assignment or Problem')
    }

    if (!reqUser.isAdmin() && !reqUser.isSuperAdmin()) {
      const isGroupLeader = await this.prisma.userGroup.findFirst({
        where: {
          userId: reqUser.id,
          groupId: assignment.groupId,
          isGroupLeader: true
        }
      })

      if (!isGroupLeader) {
        throw new ForbiddenAccessException(
          'Only group leaders can rejudge submissions'
        )
      }
    }

    return { assignment, problem }
  }

  /**
   * 재채점할 submission 목록 조회
   */
  private async fetchSubmissionsForRejudge(
    assignmentId: number,
    problemId: number
  ) {
    return this.prisma.submission.findMany({
      where: { assignmentId, problemId },
      select: {
        id: true,
        code: true,
        language: true,
        userId: true,
        userIp: true,
        result: true,
        createTime: true
      },
      orderBy: { createTime: 'desc' }
    })
  }

  /**
   * 모드에 따라 재채점할 submission 준비
   */
  private async prepareSubmissionsForRejudge(
    submissions: Array<{
      id: number
      code: Prisma.JsonValue[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      language: any
      userId: number | null
      userIp: string | null
      result: PrismaResultStatus
      createTime: Date
    }>,
    problem: {
      id: number
      title: string
      timeLimit: number
      memoryLimit: number
    },
    assignmentId: number,
    mode: RejudgeMode
  ) {
    if (mode === RejudgeMode.REPLACE_EXISTING) {
      await this.resetExistingSubmissions(
        submissions.map((s) => s.id),
        problem.id
      )
      return submissions.map((s) => ({ ...s, targetId: s.id }))
    } else {
      return await this.createNewSubmissionsForRejudge(
        submissions,
        problem,
        assignmentId
      )
    }
  }

  /**
   * 기존 submission들을 Juding 상태로 변경 및 테스트케이스 최신화
   */
  private async resetExistingSubmissions(
    submissionIds: number[],
    problemId: number
  ) {
    // 상태를 Judging으로 변경
    await this.prisma.submission.updateMany({
      where: { id: { in: submissionIds } },
      data: { result: PrismaResultStatus.Judging }
    })

    // 기존 결과 삭제
    await this.prisma.submissionResult.deleteMany({
      where: { submissionId: { in: submissionIds } }
    })

    // 새로운 결과 생성
    await Promise.all(
      submissionIds.map((id) =>
        this.createSubmissionResultsForRejudge({ id, problemId })
      )
    )

    this.logger.log(
      `Reset ${submissionIds.length} submissions for rejudge (REPLACE_EXISTING mode)`
    )
  }

  /**
   * 재채점을 위한 새로운 submission들 생성
   */
  private async createNewSubmissionsForRejudge(
    submissions: Array<{
      id: number
      code: Prisma.JsonValue[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      language: any
      userId: number | null
      userIp: string | null
      result: PrismaResultStatus
      createTime: Date
    }>,
    problem: {
      id: number
      title: string
      timeLimit: number
      memoryLimit: number
    },
    assignmentId: number
  ) {
    const newSubmissions: Array<{
      id: number
      code: Prisma.JsonValue[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      language: any
      userId: number | null
      userIp: string | null
      result: PrismaResultStatus
      createTime: Date
      targetId: number
    }> = []

    for (const submission of submissions) {
      const submissionData = {
        code: submission.code,
        result: PrismaResultStatus.Judging,
        userId: submission.userId,
        userIp: submission.userIp || '127.0.0.1',
        problemId: problem.id,
        assignmentId,
        codeSize: new TextEncoder().encode(
          plainToInstance(Snippet, submission.code)[0].text
        ).length,
        language: submission.language,
        createTime: submission.createTime
      }

      const newSubmission = await this.prisma.submission.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: submissionData as any
      })

      await this.createSubmissionResultsForRejudge(newSubmission)

      this.logger.log(
        `Created new submission ${newSubmission.id} for rejudge from original ${submission.id}`
      )

      newSubmissions.push({ ...submission, targetId: newSubmission.id })
    }

    return newSubmissions
  }

  /**
   * 준비된 submission들에 대해 채점 요청 메시지 발행
   */
  private async publishJudgeRequests(
    submissions: Array<{
      id: number
      code: Prisma.JsonValue[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      language: any
      targetId: number
    }>,
    problem: {
      id: number
      timeLimit: number
      memoryLimit: number
    }
  ): Promise<number> {
    let processedCount = 0

    for (const submission of submissions) {
      try {
        const code = plainToInstance(Snippet, submission.code)
        const judgeRequest = new JudgeRequest(
          code,
          submission.language,
          {
            id: problem.id,
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit
          },
          false,
          false,
          false
        )

        await this.amqpService.publishJudgeRequestMessage(
          judgeRequest,
          submission.targetId,
          false,
          false,
          true // isRejudge
        )

        processedCount++
        this.logger.log(
          `Published rejudge request for submission ${submission.targetId}`
        )
      } catch (error) {
        this.logger.error(
          `Failed to publish rejudge request for submission ${submission.id}:`,
          error
        )
      }
    }

    return processedCount
  }

  /**
   * 빈 재채점 결과 생성
   */
  private createEmptyRejudgeResult(totalCount: number): RejudgeResult {
    return {
      totalSubmissions: totalCount,
      processedSubmissions: 0,
      message:
        totalCount === 0
          ? 'No submissions found for this assignment problem'
          : 'No valid submissions found after filtering (all submissions may have null userId)'
    }
  }

  /**
   * 재채점 결과 생성
   */
  private createRejudgeResult(
    totalCount: number,
    processedCount: number,
    mode: RejudgeMode
  ): RejudgeResult {
    const message =
      mode === RejudgeMode.REPLACE_EXISTING
        ? `Rejudge initiated for ${processedCount} latest submissions per user (${totalCount} total submissions found). All existing results have been reset to Judging.`
        : `Rejudge initiated for ${processedCount} latest submissions per user (${totalCount} total submissions found). New results will be created alongside existing ones.`

    return {
      totalSubmissions: totalCount,
      processedSubmissions: processedCount,
      message
    }
  }

  /**
   * 각 user의 가장 최신 submission만 필터링
   *
   * @param submissions 제출 목록
   * @returns 각 user의 가장 최신 submission만 포함된 배열
   */
  private filterLatestSubmissionsPerUser(
    submissions: Array<{
      id: number
      code: Prisma.JsonValue[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      language: any
      userId: number | null
      userIp: string | null
      result: PrismaResultStatus
      createTime: Date
    }>
  ) {
    // userId별로 그룹화하고 각 그룹에서 가장 최신 submission만 선택
    const userLatestSubmissions = new Map<number, (typeof submissions)[0]>()

    for (const submission of submissions) {
      if (submission.userId === null) {
        continue
      }

      const existingSubmission = userLatestSubmissions.get(submission.userId)

      if (
        !existingSubmission ||
        submission.createTime > existingSubmission.createTime
      ) {
        userLatestSubmissions.set(submission.userId, submission)
      }
    }

    return Array.from(userLatestSubmissions.values())
  }

  /**
   * 재채점을 위한 새로운 submission의 SubmissionResult를 생성
   */
  private async createSubmissionResultsForRejudge(submission: {
    id: number
    problemId: number
  }): Promise<void> {
    const testcases = await this.prisma.problemTestcase.findMany({
      where: {
        problemId: submission.problemId,
        isOutdated: false
      },
      select: { id: true }
    })

    await this.prisma.submissionResult.createMany({
      data: testcases.map((testcase) => {
        return {
          submissionId: submission.id,
          result: PrismaResultStatus.Judging,
          problemTestcaseId: testcase.id
        }
      })
    })
  }
}
