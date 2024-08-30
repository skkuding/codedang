import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ForbiddenAccessException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { ContestService } from '@client/contest/contest.service'
import { WorkbookService } from '@client/workbook/workbook.service'
import { CodeDraftResponseDto } from './dto/code-draft.response.dto'
import type { CreateTemplateDto } from './dto/create-code-draft.dto'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { ProblemsResponseDto } from './dto/problems.response.dto'
import { RelatedProblemResponseDto } from './dto/related-problem.response.dto'
import { RelatedProblemsResponseDto } from './dto/related-problems.response.dto'
import type { ProblemOrder } from './enum/problem-order.enum'
import { ProblemRepository } from './problem.repository'

@Injectable()
export class ProblemService {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async getProblems(options: {
    userId: number | null
    cursor: number | null
    take: number
    groupId: number
    order?: ProblemOrder
    search?: string
  }) {
    const unprocessedProblems =
      await this.problemRepository.getProblems(options)

    const uniqueTagIds = new Set(
      unprocessedProblems.flatMap((item) => {
        return item.problemTag.map((item2) => item2.tagId)
      })
    )
    const tagIds = [...uniqueTagIds]
    const tagList = await this.problemRepository.getProblemsTags(tagIds)

    const problems = unprocessedProblems.map(async (problem) => {
      let hasPassed: boolean | null = null
      const { problemTag, ...data } = problem
      const problemTags = problemTag.map((tag) => tag.tagId)
      const tags = tagList.filter((tagItem) => problemTags.includes(tagItem.id))
      if (options.userId) {
        hasPassed = await this.problemRepository.hasPassedProblem(
          options.userId,
          { problemId: problem.id }
        )
      }
      return {
        ...data,
        tags,
        hasPassed
      }
    })

    const total = await this.problemRepository.getProblemTotalCount(
      options.groupId,
      options.search
    )

    return plainToInstance(ProblemsResponseDto, {
      data: await Promise.all(problems),
      total
    })
  }

  async getProblem(problemId: number, groupId = OPEN_SPACE_ID) {
    const data = await this.problemRepository.getProblem(problemId, groupId)
    const tags = await this.problemRepository.getProblemTags(problemId)
    return plainToInstance(ProblemResponseDto, { ...data, tags })
  }
}

@Injectable()
export class ContestProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly problemRepository: ProblemRepository,
    private readonly contestService: ContestService
  ) {}

  async getContestProblems(
    contestId: number,
    userId: number,
    cursor: number | null,
    take: number,
    groupId = OPEN_SPACE_ID
  ) {
    const contest = await this.contestService.getContest(
      contestId,
      groupId,
      userId
    )
    const now = new Date()
    if (contest.isRegistered && contest.startTime > now) {
      throw new ForbiddenAccessException(
        'Cannot access problems before the contest starts.'
      )
    } else if (!contest.isRegistered && contest.endTime > now) {
      throw new ForbiddenAccessException(
        'Register to access the problems of this contest.'
      )
    }

    const [contestProblems, submissions] = await Promise.all([
      this.problemRepository.getContestProblems(contestId, cursor, take),
      this.prisma.submission.findMany({
        where: {
          userId,
          contestId
        },
        select: {
          problemId: true,
          score: true,
          createTime: true
        },
        orderBy: {
          createTime: 'desc'
        }
      })
    ])

    const submissionMap = new Map<number, { score: number; createTime: Date }>()
    for (const submission of submissions) {
      if (!submissionMap.has(submission.problemId)) {
        submissionMap.set(submission.problemId, submission)
      }
    }

    const contestProblemsWithScore = contestProblems.map((contestProblem) => {
      const submission = submissionMap.get(contestProblem.problemId)
      if (!submission) {
        return {
          ...contestProblem,
          maxScore: contestProblem.score,
          score: null,
          submissionTime: null
        }
      }
      return {
        ...contestProblem,
        maxScore: contestProblem.score,
        score: ((submission.score * contestProblem.score) / 100).toFixed(0),
        submissionTime: submission.createTime ?? null
      }
    })

    const total =
      await this.problemRepository.getContestProblemTotalCount(contestId)

    return plainToInstance(RelatedProblemsResponseDto, {
      data: contestProblemsWithScore,
      total
    })
  }

  async getContestProblem(
    contestId: number,
    problemId: number,
    userId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const contest = await this.contestService.getContest(
      contestId,
      groupId,
      userId
    )
    const now = new Date()
    if (contest.isRegistered && contest.startTime > now) {
      throw new ForbiddenAccessException(
        'Cannot access to problems before the contest starts.'
      )
    } else if (!contest.isRegistered && contest.endTime > now) {
      throw new ForbiddenAccessException('Register to access this problem.')
    }

    const data = await this.problemRepository.getContestProblem(
      contestId,
      problemId
    )
    return plainToInstance(RelatedProblemResponseDto, data)
  }
}

@Injectable()
export class WorkbookProblemService {
  constructor(
    private readonly problemRepository: ProblemRepository,
    private readonly workbookService: WorkbookService
  ) {}

  async getWorkbookProblems(
    workbookId: number,
    cursor: number | null,
    take: number,
    groupId = OPEN_SPACE_ID
  ) {
    if (!(await this.workbookService.isVisible(workbookId, groupId))) {
      throw new EntityNotExistException('Workbook')
    }
    const data = await this.problemRepository.getWorkbookProblems(
      workbookId,
      cursor,
      take
    )

    const total =
      await this.problemRepository.getWorkbookProblemTotalCount(workbookId)

    return plainToInstance(RelatedProblemsResponseDto, {
      data,
      total
    })
  }

  async getWorkbookProblem(
    workbookId: number,
    problemId: number,
    groupId = OPEN_SPACE_ID
  ) {
    if (!(await this.workbookService.isVisible(workbookId, groupId))) {
      throw new EntityNotExistException('Workbook')
    }
    const data = await this.problemRepository.getWorkbookProblem(
      workbookId,
      problemId
    )
    return plainToInstance(RelatedProblemResponseDto, data)
  }
}

@Injectable()
export class CodeDraftService {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async getCodeDraft(userId: number, problemId: number) {
    const data = await this.problemRepository.getCodeDraft(userId, problemId)
    return plainToInstance(CodeDraftResponseDto, data)
  }

  async upsertCodeDraft(
    userId: number,
    problemId: number,
    createTemplateDto: CreateTemplateDto
  ) {
    const data = await this.problemRepository.upsertCodeDraft(
      userId,
      problemId,
      createTemplateDto
    )
    return plainToInstance(CodeDraftResponseDto, data)
  }
}
