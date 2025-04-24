import { Injectable, Logger } from '@nestjs/common'
import { Prisma, type Submission } from '@prisma/client'
import * as archiver from 'archiver'
import { plainToInstance } from 'class-transformer'
import { Response } from 'express'
import {
  mkdirSync,
  writeFile,
  createWriteStream,
  createReadStream,
  existsSync,
  unlink,
  rm
} from 'fs'
import { Span } from 'nestjs-otel'
import path from 'path'
import sanitize from 'sanitize-filename'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException,
  UnprocessableFileDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { SubmissionPublicationService } from '@libs/rabbitmq'
import {
  ContestRole,
  ResultStatus,
  Role,
  type Language
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly publish: SubmissionPublicationService
  ) {}

  async getSubmissions(
    problemId: number,
    cursor: number | null,
    take: number
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

    const submissions = await this.prisma.submission.findMany({
      ...paginator,
      take,
      where: {
        problemId
      },
      include: {
        user: true
      },
      orderBy: [{ id: 'desc' }, { createTime: 'desc' }]
    })

    const total = await this.prisma.submission.count({
      where: { problemId }
    })

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
                output: true
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
            'failed to handle source code file.',
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
        'failed to create zip file',
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
    fileStream.on('error', (err) => {
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
   * 전달한 제출 기록에 대해 아직 채점되지 않은 테스트케이스 채점 결과들을 생성합니다.
   *
   * 제출된 문제에 연결된 모든 테스트 케이스를 조회한 후,
   * 각 테스트 케이스에 대해 제출 결과 레코드를 생성하고 초기 상태(ResultStatus.Judging)로 설정
   *
   * @param {Submission} submission - 테스트 케이스 결과를 생성할 제출 기록
   * @returns {Promise<void>}
   */
  @Span()
  async createSubmissionResults(submission: Submission): Promise<void> {
    const testcases = await this.prisma.problemTestcase.findMany({
      where: {
        problemId: submission.problemId
      },
      select: { id: true }
    })

    await this.prisma.submissionResult.createMany({
      data: testcases.map((testcase) => {
        return {
          submissionId: submission.id,
          result: ResultStatus.Judging,
          problemTestcaseId: testcase.id
        }
      })
    })
  }

  async rejudgeSubmissionsByProblem(
    problemId: number,
    contestId?: number | null | undefined,
    assignmentId?: number | null | undefined,
    workbookId?: number | null | undefined
  ): Promise<{
    successCount: number
    failedSubmissions: { submissionId: number; error: string }[]
  }> {
    const failedSubmissions: { submissionId: number; error: string }[] = [] // 실패한 제출을 추적할 배열
    let successCount = 0 // 성공한 제출 수
    try {
      // 문제 ID에 해당하는 제출 기록 조회
      const submissions = await this.prisma.submission.findMany({
        where: {
          problemId,
          ...(contestId != undefined && { contestId }),
          ...(assignmentId != undefined && { assignmentId }),
          ...(workbookId != undefined && { workbookId })
        },
        include: { problem: true, rejudgedSubmissions: true }
      })

      if (!submissions.length) {
        throw new EntityNotExistException(
          `No submissions found for problem ID ${problemId}`
        )
      }
      let code: Snippet[]
      // 제출 목록을 순차적으로 처리
      for (const submission of submissions) {
        try {
          // Snippet 변환
          try {
            code = submission.code as unknown as Snippet[]
          } catch (error) {
            throw new UnprocessableDataException('Invalid snippet format')
          }

          const {
            id,
            createTime,
            updateTime,
            problem,
            rejudgedSubmissions,
            ...submissionBaseData
          } = submission // 불필요한 필드 제거

          const [updatedSubmission, rejudgedSubmission] =
            await this.prisma.$transaction([
              this.prisma.submission.update({
                where: { id: submission.id },
                data: {
                  isRejudged: true,
                  rejudgedSubmissions: { connect: { id: submission.id } } //기존 제출에 새롭게 재채점된 제출 연결
                }
              }),
              this.prisma.submission.create({
                data: {
                  ...submissionBaseData,
                  code: JSON.parse(JSON.stringify(submission.code)), //JSON 변환 처리
                  result: ResultStatus.Judging,
                  score: 0,
                  rejudgedFromId: submission.id, //원본 제출(A)과의 관계 설정
                  isRejudged: false
                }
              })
            ])

          //A의 rejudgedSubmissions에 B 추가
          await this.prisma.submission.update({
            where: { id: submission.id },
            data: {
              rejudgedSubmissions: {
                connect: { id: rejudgedSubmission.id }
              }
            }
          })

          // 새롭게 채점 결과 생성
          await this.createSubmissionResults(rejudgedSubmission)

          // 채점 요청 발행
          await this.publish.publishJudgeRequestMessage(
            code,
            rejudgedSubmission
          )

          // 제출 상태 업데이트 (채점 중으로)
          await this.prisma.submission.update({
            where: { id: rejudgedSubmission.id },
            data: { result: ResultStatus.Judging }
          })

          successCount++
        } catch (error) {
          // 오류가 발생한 경우 실패한 제출에 추가
          failedSubmissions.push({
            submissionId: submission.id,
            error: error.message || 'Unknown error'
          })
        }
      }
      // 전체 성공 및 실패한 제출 수를 응답으로 반환
      return {
        successCount,
        failedSubmissions
      }
    } catch (error) {
      // 전체적으로 실패한 경우 처리
      throw new EntityNotExistException(`${error.message}`)
    }
  }

  async rejudgeSubmissionById(
    submissionId: number
  ): Promise<{ success: boolean; error?: string }> {
    // 제출 기록 조회
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { problem: true, rejudgedSubmissions: true }
    })

    if (!submission) {
      throw new EntityNotExistException(
        `Submission with ID ${submissionId} not found`
      )
    }
    let code: Snippet[]

    try {
      // Snippet 변환
      try {
        code = submission.code as unknown as Snippet[]
      } catch (error) {
        throw new UnprocessableDataException('Invalid snippet format')
      }

      const {
        id,
        createTime,
        updateTime,
        problem,
        rejudgedSubmissions,
        ...submissionBaseData
      } = submission // 불필요한 필드 제거

      const [updatedSubmission, rejudgedSubmission] =
        await this.prisma.$transaction([
          this.prisma.submission.update({
            where: { id: submission.id },
            data: {
              isRejudged: true,
              rejudgedSubmissions: { connect: { id: submission.id } } //기존 제출에 새롭게 재채점된 제출 연결
            }
          }),
          this.prisma.submission.create({
            data: {
              ...submissionBaseData,
              code: JSON.parse(JSON.stringify(submission.code)), //JSON 변환 처리
              result: ResultStatus.Judging,
              score: 0,
              rejudgedFromId: submission.id, //원본 제출(A)과의 관계 설정
              isRejudged: false
            }
          })
        ])

      //A의 rejudgedSubmissions에 B 추가
      await this.prisma.submission.update({
        where: { id: submission.id },
        data: {
          rejudgedSubmissions: {
            connect: { id: rejudgedSubmission.id }
          }
        }
      })

      // 새롭게 채점 결과 생성
      await this.createSubmissionResults(rejudgedSubmission)

      // 채점 요청 발행
      await this.publish.publishJudgeRequestMessage(code, rejudgedSubmission)

      // 제출 상태 업데이트
      await this.prisma.submission.update({
        where: { id: rejudgedSubmission.id },
        data: { result: ResultStatus.Judging }
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || 'Unknown error' }
    }
  }
}
