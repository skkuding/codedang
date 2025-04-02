import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import * as archiver from 'archiver'
import { plainToInstance } from 'class-transformer'
import { mkdirSync, writeFile, createWriteStream, ReadStream } from 'fs'
import path from 'path'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { Language, ResultStatus } from '@admin/@generated'
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
  constructor(private readonly prisma: PrismaService) {}

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
    problemId: number
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

    return this.getSubmission(submissionId.id)
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
    return encodeURIComponent(assignment.title)
  }

  async getZipFileSize(readStream: ReadStream): Promise<number> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      readStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      readStream.on('end', () => {
        const fileSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        resolve(fileSize)
      })

      readStream.on('error', () => {
        reject(
          new UnprocessableDataException(
            'Error occurred during calculating file size.'
          )
        )
      })
    })
  }

  async downloadCodes(
    groupId: number,
    assignmentId: number,
    problemId: number
  ) {
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

    const assignmentTitle = await this.getAssignmentTitle(assignmentId)
    const dirPath = path.join(__dirname, assignmentTitle!)
    mkdirSync(dirPath, { recursive: true })

    submissionInfos.forEach((info) => {
      const code = plainToInstance(Snippet, info.code)
      const formattedCode = code.map((snippet) => snippet.text).join('\n')
      const filename = `${info.user?.studentId}${LanguageExtension[info.language]}`
      const filePath = path.join(dirPath, filename)
      writeFile(filePath, formattedCode, (err) => {
        if (err) {
          console.error(err)
        }
      })
    })
    const zipFilename = `${assignmentTitle}_${problemId}.zip`
    const zipPath = path.join(__dirname, zipFilename)
    const output = createWriteStream(zipPath)
    const archive = archiver.create('zip', { zlib: { level: 9 } })

    archive.on('error', (err) => {
      throw err
    })
    archive.pipe(output)
    archive.directory(dirPath, assignmentTitle!)
    await archive.finalize()
  }
}
