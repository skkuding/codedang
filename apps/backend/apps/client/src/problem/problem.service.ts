import { Injectable } from '@nestjs/common'
import { Prisma, ResultStatus } from '@prisma/client'
import { MIN_DATE, OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type {
  CodeDraftCreateInput,
  CodeDraftUpdateInput
} from '@admin/@generated'
import { ContestService } from '@client/contest/contest.service'
import { WorkbookService } from '@client/workbook/workbook.service'
import { CodeDraftResponseDto } from './dto/code-draft.response.dto'
import { CreateTemplateDto } from './dto/create-code-draft.dto'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { ProblemsResponseDto } from './dto/problems.response.dto'
import { RelatedProblemResponseDto } from './dto/related-problem.response.dto'
import { RelatedProblemsResponseDto } from './dto/related-problems.response.dto'
import { ProblemOrder } from './enum/problem-order.enum'

const problemsSelectOption: Prisma.ProblemSelect = {
  id: true,
  title: true,
  engTitle: true,
  difficulty: true,
  acceptedRate: true,
  submissionCount: true,
  languages: true
}

const problemSelectOption: Prisma.ProblemSelect = {
  ...problemsSelectOption,
  description: true,
  inputDescription: true,
  outputDescription: true,
  hint: true,
  engDescription: true,
  engInputDescription: true,
  engOutputDescription: true,
  engHint: true,
  timeLimit: true,
  memoryLimit: true,
  source: true,
  acceptedCount: true,
  template: true,
  problemTestcase: {
    where: {
      isHidden: false
    },
    select: {
      id: true,
      input: true,
      output: true
    }
  }
}

const codeDraftSelectOption = {
  userId: true,
  problemId: true,
  template: true,
  createTime: true,
  updateTime: true
}
@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

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
  }): Promise<ProblemsResponseDto> {
    const { cursor, take, order, groupId, search } = options
    const paginator = this.prisma.getPaginator(cursor)

    /* eslint-disable @typescript-eslint/naming-convention */
    const orderByMapper: Record<
      ProblemOrder,
      Prisma.ProblemOrderByWithRelationInput[]
    > = {
      'id-asc': [{ id: 'asc' }],
      'id-desc': [{ id: 'desc' }],
      'title-asc': [{ title: 'asc' }, { id: 'asc' }],
      'title-desc': [{ title: 'desc' }, { id: 'asc' }],
      'level-asc': [{ difficulty: 'asc' }, { id: 'asc' }],
      'level-desc': [{ difficulty: 'desc' }, { id: 'asc' }],
      'acrate-asc': [{ acceptedRate: 'asc' }, { id: 'asc' }],
      'acrate-desc': [{ acceptedRate: 'desc' }, { id: 'asc' }],
      'submit-asc': [{ submissionCount: 'asc' }, { id: 'asc' }],
      'submit-desc': [{ submissionCount: 'desc' }, { id: 'asc' }]
    }
    /* eslint-enable @typescript-eslint/naming-convention */

    const orderBy = orderByMapper[order ?? 'id-asc']

    const unprocessedProblems =
      // await this.problemRepository.getProblems(options)
      await this.prisma.problem.findMany({
        ...paginator,
        take,
        orderBy,
        where: {
          groupId,
          title: {
            // TODO/FIXME: postgreSQL의 full text search를 사용하여 검색하려 했으나
            // 그럴 경우 띄어쓰기를 기준으로 나눠진 단어 단위로만 검색이 가능하다
            // ex) "hello world"를 검색하면 "hello"와 "world"로 검색이 된다.
            // 글자 단위로 검색하기 위해서, 성능을 희생하더라도 contains를 사용하여 구현했다.
            // 추후에 검색 성능을 개선할 수 있는 방법을 찾아보자
            // 아니면 텍스트가 많은 field에서는 full-text search를 사용하고, 텍스트가 적은 field에서는 contains를 사용하는 방법도 고려해보자.
            contains: search
          },
          visibleLockTime: MIN_DATE
        },
        select: {
          ...problemsSelectOption,
          problemTag: {
            select: {
              tagId: true
            }
          }
        }
      })

    const uniqueTagIds = new Set(
      unprocessedProblems.flatMap((item) => {
        return item.problemTag.map((item2) => item2.tagId)
      })
    )
    const tagIds = [...uniqueTagIds]
    const tagList = await this.prisma.tag.findMany({
      where: {
        id: {
          in: tagIds
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    const problems = unprocessedProblems.map(async (problem) => {
      const {
        problemTag,
        acceptedRate,
        difficulty,
        engTitle,
        id,
        languages,
        submissionCount,
        title
      } = problem
      let hasPassed: boolean | null = null
      const problemTags = problemTag.map((tag) => tag.tagId)
      const tags = tagList.filter((tagItem) => problemTags.includes(tagItem.id))
      if (options.userId) {
        // hasPassed = await this.problemRepository.hasPassedProblem(
        //   options.userId,
        //   { problemId: problem.id }
        // )

        const submissions = await this.prisma.submission.findMany({
          where: {
            problemId: problem.id,
            userId: options.userId
          },
          select: { result: true }
        })

        hasPassed = submissions.length
          ? submissions.some(
              (submission) => submission.result === ResultStatus.Accepted
            )
          : null
      }
      return {
        id,
        title,
        engTitle,
        difficulty,
        acceptedRate,
        submissionCount,
        languages,
        tags,
        hasPassed
      }
    })

    // const total = await this.problemRepository.getProblemTotalCount(
    //   options.groupId,
    //   options.search
    // )

    const total = await this.prisma.problem.count({
      where: {
        groupId,
        title: {
          // TODO: 검색 방식 변경 시 함께 변경 요함
          contains: search
        },
        visibleLockTime: MIN_DATE
      }
    })

    // return plainToInstance(ProblemsResponseDto, {
    //   data: await Promise.all(problems),
    //   total
    // })
    return {
      data: await Promise.all(problems),
      total
    }
  }

  async getProblem(
    problemId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<ProblemResponseDto> {
    // const data = await this.problemRepository.getProblem(problemId, groupId)
    const data = await this.prisma.problem.findUniqueOrThrow({
      where: {
        id: problemId,
        groupId,
        visibleLockTime: MIN_DATE
      },
      select: problemSelectOption
    })

    // const tags = await this.problemRepository.getProblemTags(problemId)
    const tags = (
      await this.prisma.problemTag.findMany({
        where: {
          problemId
        },
        select: {
          tag: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    ).map((tag) => tag.tag)

    // return plainToInstance(ProblemResponseDto, { ...data, tags })
    return {
      ...data,
      tags
    }
  }
}

@Injectable()
export class ContestProblemService {
  constructor(
    private readonly prisma: PrismaService,
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
  ): Promise<RelatedProblemsResponseDto> {
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

    const paginator = this.prisma.getPaginator(cursor, (value) => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      contestId_problemId: {
        contestId,
        problemId: value
      }
    }))

    const [contestProblems, submissions] = await Promise.all([
      // this.problemRepository.getContestProblems(contestId, cursor, take),
      this.prisma.contestProblem.findMany({
        ...paginator,
        take,
        orderBy: { order: 'asc' },
        where: {
          contestId
        },
        select: {
          order: true,
          problem: {
            select: problemsSelectOption
          },
          problemId: true,
          score: true
        }
      }),
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
      const { problemId, problem, order } = contestProblem
      const submission = submissionMap.get(problemId)
      if (!submission) {
        return {
          order,
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          submissionCount: problem.submissionCount,
          acceptedRate: problem.acceptedRate,
          maxScore: contest.isJudgeResultVisible ? contestProblem.score : null,
          score: null,
          submissionTime: null
        }
      }
      return {
        // ...contestProblem,
        order,
        id: contestProblem.problem.id,
        title: contestProblem.problem.title,
        difficulty: contestProblem.problem.difficulty,
        submissionCount: contestProblem.problem.submissionCount,
        acceptedRate: contestProblem.problem.acceptedRate,
        maxScore: contest.isJudgeResultVisible ? contestProblem.score : null,
        score: contest.isJudgeResultVisible
          ? ((submission.score * contestProblem.score) / 100).toFixed(0)
          : null,
        submissionTime: submission.createTime ?? null
      }
    })

    // const total =
    //   await this.problemRepository.getContestProblemTotalCount(contestId)
    const total = await this.prisma.contestProblem.count({
      where: {
        contestId
      }
    })

    // return plainToInstance(RelatedProblemsResponseDto, {
    //   data: contestProblemsWithScore,
    //   total
    // })
    return {
      data: contestProblemsWithScore,
      total
    }
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
  ): Promise<RelatedProblemResponseDto> {
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

    // const data = await this.problemRepository.getContestProblem(
    //   contestId,
    //   problemId
    // )

    const data = await this.prisma.contestProblem.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_problemId: {
          contestId,
          problemId
        }
      },
      select: {
        order: true,
        problem: {
          select: problemSelectOption
        }
      }
    })

    const tags = (
      await this.prisma.problemTag.findMany({
        where: {
          problemId
        },
        select: {
          tag: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    ).map((tag) => tag.tag)

    const excludedFields = [
      'createTime',
      'createdById',
      'groupId',
      'problemTag',
      'submission',
      'updateTime',
      'visibleLockTime'
    ]

    const problem = { ...data.problem } // 원본 객체를 복사해서 안전하게 작업
    excludedFields.forEach((key) => {
      delete problem[key]
    })

    // return plainToInstance(RelatedProblemResponseDto, data)
    return {
      order: data.order,
      problem: {
        ...problem,
        tags
      }
    }
  }
}

@Injectable()
export class WorkbookProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workbookService: WorkbookService
  ) {}

  async getWorkbookProblems(
    workbookId: number,
    cursor: number | null,
    take: number,
    groupId = OPEN_SPACE_ID
  ): Promise<RelatedProblemsResponseDto> {
    const isVisible = await this.workbookService.isVisible(workbookId, groupId)
    if (!isVisible) {
      throw new ForbiddenAccessException(
        'You do not have access to this workbook.'
      )
    }
    // const data = await this.problemRepository.getWorkbookProblems(
    //   workbookId,
    //   cursor,
    //   take
    // )

    const paginator = this.prisma.getPaginator(cursor, (value) => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      workbookId_problemId: {
        workbookId,
        problemId: value
      }
    }))

    const data = await this.prisma.workbookProblem.findMany({
      ...paginator,
      take,
      where: {
        workbookId,
        problem: {
          visibleLockTime: MIN_DATE
        }
      },
      select: {
        order: true,
        problem: {
          select: problemsSelectOption
        }
      }
    })

    // const total =
    //   await this.problemRepository.getWorkbookProblemTotalCount(workbookId)

    const total = await this.prisma.workbookProblem.count({
      where: {
        workbookId,
        problem: {
          visibleLockTime: MIN_DATE
        }
      }
    })

    // return plainToInstance(RelatedProblemsResponseDto, {
    //   data,
    //   total
    // })

    const exceptFields = [
      'acceptedCount',
      'createTime',
      'createdById',
      'description',
      'engDescription',
      'engHint',
      'engInputDescription',
      'engOutputDescription',
      'engTitle',
      'groupId',
      'hint',
      'inputDescription',
      'languages',
      'outputDescription',
      'problemTag',
      'problemTestcase',
      'source',
      'submission',
      'submissionTime',
      'template',
      'timeLimit',
      'memoryLimit',
      'updateTime',
      'visibleLockTime'
    ]

    return {
      data: data.map((item) => {
        const problem = { ...item.problem }
        exceptFields.forEach((key) => {
          delete problem[key]
        })
        return {
          order: item.order,
          maxScore: null,
          score: null,
          submissionTime: null,
          ...problem
        }
      }),
      total
    }
  }

  async getWorkbookProblem(
    workbookId: number,
    problemId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<RelatedProblemResponseDto> {
    const isVisible = await this.workbookService.isVisible(workbookId, groupId)
    if (!isVisible) {
      throw new ForbiddenAccessException(
        'You do not have access to this workbook.'
      )
    }
    // const data = await this.problemRepository.getWorkbookProblem(
    //   workbookId,
    //   problemId
    // )

    const data = await this.prisma.workbookProblem.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workbookId_problemId: {
          workbookId,
          problemId
        },
        problem: {
          visibleLockTime: MIN_DATE
        }
      },
      select: {
        order: true,
        problem: {
          select: problemSelectOption
        }
      }
    })

    const tags = (
      await this.prisma.problemTag.findMany({
        where: {
          problemId
        },
        select: {
          tag: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    ).map((tag) => tag.tag)

    const excludedFields = [
      'createTime',
      'createdById',
      'groupId',
      'problemTag',
      'submission',
      'updateTime',
      'visibleLockTime'
    ]
    const problem = { ...data.problem }
    excludedFields.forEach((key) => {
      delete problem[key]
    })

    // return plainToInstance(RelatedProblemResponseDto, data)
    return {
      order: data.order,
      problem: {
        ...problem,
        tags
      }
    }
  }
}

@Injectable()
export class CodeDraftService {
  constructor(private readonly prisma: PrismaService) {}

  async getCodeDraft(
    userId: number,
    problemId: number
  ): Promise<CodeDraftResponseDto> {
    // const data = await this.problemRepository.getCodeDraft(userId, problemId)
    const data = await this.prisma.codeDraft.findUniqueOrThrow({
      where: {
        codeDraftId: {
          userId,
          problemId
        }
      },
      select: codeDraftSelectOption
    })
    // return plainToInstance(CodeDraftResponseDto, data)
    return data
  }

  async upsertCodeDraft(
    userId: number,
    problemId: number,
    createTemplateDto: CreateTemplateDto
  ): Promise<CodeDraftResponseDto> {
    // const data = await this.problemRepository.upsertCodeDraft(
    //   userId,
    //   problemId,
    //   createTemplateDto
    // )
    let data
    try {
      data = await this.prisma.codeDraft.upsert({
        where: {
          codeDraftId: {
            userId,
            problemId
          }
        },
        update: {
          template:
            createTemplateDto.template as CodeDraftUpdateInput['template']
        },
        create: {
          userId,
          problemId,
          template:
            createTemplateDto.template as CodeDraftCreateInput['template']
        },
        select: codeDraftSelectOption
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictFoundException('CodeDraft already exists.')
        } else if (error.code === 'P2003') {
          throw new EntityNotExistException('User or Problem')
        } else {
          throw new UnprocessableDataException('Invalid data provided.')
        }
      }
      throw error
    }
    // return plainToInstance(CodeDraftResponseDto, data)
    return data
  }
}
