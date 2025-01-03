import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { OPEN_SPACE_ID } from '@libs/constants'
import { ForbiddenAccessException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { ContestService } from '@client/contest/contest.service'
import { WorkbookService } from '@client/workbook/workbook.service'
import { CodeDraftResponseDto } from './dto/code-draft.response.dto'
import { CreateTemplateDto } from './dto/create-code-draft.dto'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { ProblemsResponseDto } from './dto/problems.response.dto'
import { RelatedProblemResponseDto } from './dto/related-problem.response.dto'
import { RelatedProblemsResponseDto } from './dto/related-problems.response.dto'
import { ProblemOrder } from './enum/problem-order.enum'
import { ProblemRepository } from './problem.repository'

@Injectable()
export class ProblemService {
  constructor(private readonly problemRepository: ProblemRepository) {}

  /**
   * 주어진 옵션에 따라 문제 목록을 가져옵니다.
   * 문제, 태그를 가져오고 사용자가 각 문제를 통과했는지 확인합니다.
   * @returns {ProblemsResponseDto} data: 문제 목록, total: 문제 총 개수
   */
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

  /**
   * 특정 문제를 가져옵니다.
   * 문제와 해당 태그를 가져와서 ProblemResponseDto 인스턴스로 변환합니다.
   * @returns {ProblemResponseDto} 문제 정보
   */
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

  /**
   * 주어진 옵션에 따라 대회 문제를 여러개 가져옵니다.
   * 이때, 사용자의 제출기록을 확인하여 각 문제의 점수를 계산합니다.
   *
   * 액세스 정책
   *
   * 대회 시작 전: 문제 액세스 불가 (Register 안하면 에러 메시지가 다름) //
   * 대회 진행 중: Register한 경우 문제 액세스 가능 //
   * 대회 종료 후: 누구나 문제 액세스 가능
   * @see [Contest Problem 정책](https://www.notion.so/skkuding/Contest-Problem-list-ad4f2718af1748bdaff607abb958ba0b?pvs=4)
   * @returns {RelatedProblemsResponseDto} data: 대회 문제 목록, total: 대회 문제 총 개수
   */
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
    if (contest.isRegistered && contest.startTime! > now) {
      throw new ForbiddenAccessException(
        'Cannot access problems before the contest starts.'
      )
    } else if (!contest.isRegistered && contest.endTime! > now) {
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
          maxScore: contest.isJudgeResultVisible ? contestProblem.score : null,
          score: null,
          submissionTime: null
        }
      }
      return {
        ...contestProblem,
        maxScore: contest.isJudgeResultVisible ? contestProblem.score : null,
        score: contest.isJudgeResultVisible
          ? ((submission.score * contestProblem.score) / 100).toFixed(0)
          : null,
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

  /**
   * 특정 대회 문제를 가져옵니다.
   *
   * 액세스 정책
   *
   * 대회 시작 전: 문제 액세스 불가 (Register 안하면 에러 메시지가 다름) //
   * 대회 진행 중: Register한 경우 문제 액세스 가능 //
   * 대회 종료 후: 누구나 문제 액세스 가능
   * @see [Contest Problem 정책](https://www.notion.so/skkuding/Contest-Problem-list-ad4f2718af1748bdaff607abb958ba0b?pvs=4)
   * @returns {RelatedProblemResponseDto} problem: 대회 문제 정보, order: 대회 문제 순서
   */
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
    if (contest.isRegistered) {
      if (now < contest.startTime!) {
        throw new ForbiddenAccessException(
          'Cannot access to Contest problem before the contest starts.'
        )
      } else if (now > contest.endTime!) {
        throw new ForbiddenAccessException(
          'Cannot access to Contest problem after the contest ends.'
        )
      }
    } else {
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
    const isVisible = await this.workbookService.isVisible(workbookId, groupId)
    if (!isVisible) {
      throw new ForbiddenAccessException(
        'You do not have access to this workbook.'
      )
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
    const isVisible = await this.workbookService.isVisible(workbookId, groupId)
    if (!isVisible) {
      throw new ForbiddenAccessException(
        'You do not have access to this workbook.'
      )
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
