import { ForbiddenException, Injectable } from '@nestjs/common'
import { Prisma, ResultStatus } from '@prisma/client'
import type { Decimal } from '@prisma/client/runtime/library'
import { MIN_DATE } from '@libs/constants'
import { ForbiddenAccessException } from '@libs/exception'
import { ProblemOrder } from '@libs/pipe'
import { PrismaService } from '@libs/prisma'
import { AssignmentService } from '@client/assignment/assignment.service'
import { ContestService } from '@client/contest/contest.service'
import { WorkbookService } from '@client/workbook/workbook.service'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { ProblemsResponseDto } from './dto/problems.response.dto'
import { RelatedProblemResponseDto } from './dto/related-problem.response.dto'

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
      isHidden: false,
      isOutdated: false
    },
    select: {
      id: true,
      input: true,
      output: true
    }
  }
}

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 주어진 옵션에 따라 문제 목록을 가져옵니다.
   * 문제, 태그를 가져오고 사용자가 각 문제를 통과했는지 확인합니다.
   * @param {number | null} userId 요청 유저의 id
   * @param {number | null} cursor 커서 값
   * @param {number} take 가져올 문제 개수
   * @param {ProblemOrder} order 정렬 기준 지정
   * @param {string} search 검색 키워드 지정
   * @returns {ProblemsResponseDto} data: 문제 목록, total: 문제 총 개수
   */
  async getProblems(options: {
    userId: number | null
    cursor: number | null
    take: number
    order?: ProblemOrder
    search?: string
  }): Promise<ProblemsResponseDto> {
    const { cursor, take, order, search } = options
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

    const unprocessedProblems = await this.prisma.problem.findMany({
      ...paginator,
      take,
      orderBy,
      where: {
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

    const total = await this.prisma.problem.count({
      where: {
        title: {
          // TODO: 검색 방식 변경 시 함께 변경 요함
          contains: search
        },
        visibleLockTime: MIN_DATE
      }
    })

    return {
      data: await Promise.all(problems),
      total
    }
  }

  /**
   * 특정 문제의 상세 정보를 조회합니다.
   * 문제의 기본 정보와 태그 목록, 업데이트 히스토리를 함께 반환합니다.
   *
   * @param {number} problemId 문제의 id
   * @returns {ProblemResponseDto} 문제 상세 정보(태그, 업데이트 히스토리 포함)
   * @throws {Prisma.PrismaClientKnownRequestError} 아래와 같은 경우 발생할 수 있습니다.
   * 해당 problemId에 대한 문제가 존재하지 않는 경우
   */
  async getProblem(problemId: number): Promise<ProblemResponseDto> {
    // const data = await this.problemRepository.getProblem(problemId, groupId)
    const data = await this.prisma.problem.findUniqueOrThrow({
      where: {
        id: problemId,
        visibleLockTime: MIN_DATE
      },
      select: problemSelectOption
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

    const updateHistory = await this.getProblemUpdateHistory(problemId)

    return {
      ...data,
      tags,
      updateHistory
    }
  }

  /**
   * 특정 문제의 업데이트 히스토리를 최신순으로 조회합니다.
   *
   * @param {number} problemId 문제의 id
   * @returns {updateHistory} 해당 문제의 업데이트 히스토리 목록
   */
  async getProblemUpdateHistory(problemId: number) {
    // 업데이트 히스토리 조회
    const updateHistory = await this.prisma.updateHistory.findMany({
      where: { problemId },
      orderBy: { updatedAt: 'desc' } // 최신순 정렬
    })

    // if (!updateHistory.length) {
    //   throw new NotFoundException('No update history found for this problem.')
    // }

    return updateHistory
  }

  /**
   * 문제 조회 시 사용할 where 조건을 mode에 따라 생성합니다.
   * my 모드에서는 본인이 생성한 문제만 조회하도록 조건을 만들고,
   * shared 모드에서는 본인이 groupleader인 그룹에 공유된 문제만 조회하도록 조건을 만듭니다.
   *
   * @param {number} userId 유저 아이디
   * @param {'my' | 'shared'} mode 모드 조건
   * @returns mode에 따른 where 조건
   * @throws {ForbiddenException} 아래와 같은 경우 발생합니다.
   * -mode가 'my' 또는 'shared'가 아닌 경우
   */
  async buildProblemWhereOptionsWithMode({
    userId,
    mode
  }: {
    userId: number
    mode: 'my' | 'shared'
  }) {
    switch (mode) {
      case 'my':
        return { createdById: { equals: userId } }

      case 'shared': {
        const leaderGroupIds = (
          await this.prisma.userGroup.findMany({
            where: {
              userId,
              isGroupLeader: true
            }
          })
        ).map((group) => group.groupId)
        return {
          sharedGroups: {
            some: {
              id: { in: leaderGroupIds }
            }
          }
        }
      }
      default:
        throw new ForbiddenException('Invalid mode')
    }
  }

  /**
   * 다운로드 가능한 문제 목록을 조회합니다.
   * my 모드에서는 본인이 생성한 문제를 조회합니다.
   * shared 모드에서는 본인이 groupleader인 그룹에 공유된 문제를 조회합니다.
   *
   * @param {number} userId 유저 아이디
   * @param {'my' | 'shared'} mode 모드 조건
   * @returns {problems} 다운로드 가능 문제 목록
   */
  async getDownloadableProblems({
    userId,
    mode
  }: {
    userId: number
    mode: 'my' | 'shared'
  }) {
    const whereOptions = await this.buildProblemWhereOptionsWithMode({
      userId,
      mode
    })

    const problems = await this.prisma.problem.findMany({
      where: whereOptions,
      select: {
        id: true,
        createdById: true,
        title: true,
        description: true,
        inputDescription: true,
        outputDescription: true,
        hint: true,
        engTitle: true,
        engDescription: true,
        engInputDescription: true,
        engOutputDescription: true,
        engHint: true,
        template: true,
        languages: true,
        solution: true,
        timeLimit: true,
        memoryLimit: true,
        difficulty: true,
        source: true,
        visibleLockTime: true,
        createTime: true,
        updateTime: true,
        updateContentTime: true,
        isSampleUploadedByZip: true,
        isHiddenUploadedByZip: true
      }
    })

    return problems
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
   * @param {number} contestId contest의 id
   * @param {number | null} userId 요청 유저의 id
   * @param {number | null} cursor 커서 값
   * @param {number} take 가져올 문제 개수
   * @returns {RelatedProblemsResponseDto} data: 대회 문제 목록, total: 대회 문제 총 개수
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -권한이 없는 유저가 콘테스트 시작 전 문제에 접근하려는 경우
   * -등록하지 않은 유저가 콘테스트 종료 전 문제에 접근하려는 경우
   */
  async getContestProblems({
    contestId,
    userId,
    cursor,
    take
  }: {
    contestId: number
    userId: number | null
    cursor: number | null
    take: number
  }) {
    const contest = await this.contestService.getContest(contestId, userId)
    const now = new Date()
    if (!contest.isPrivilegedRole) {
      if (contest.isRegistered) {
        if (now < contest.startTime!) {
          throw new ForbiddenAccessException(
            'Cannot access to ContestProblem before the Contest starts'
          )
        }
      } else {
        if (now < contest.endTime!) {
          throw new ForbiddenAccessException(
            'Register to access ContestProblem'
          )
        }
      }
    }

    const paginator = this.prisma.getPaginator(cursor, (value) => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      contestId_problemId: {
        contestId,
        problemId: value
      }
    }))

    const [contestProblems, submissions] = await Promise.all([
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

    const submissionMap = new Map<
      number,
      { score: Decimal; createTime: Date }
    >()
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
          submissionTime: null,
          updateContentTime: problem.updateContentTime,
          isHiddenUploadedByZip: problem.isHiddenUploadedByZip,
          isSampleUploadedByZip: problem.isSampleUploadedByZip
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
          ? submission.score.mul(contestProblem.score).div(100).toFixed(0)
          : null,
        submissionTime: submission.createTime ?? null,
        updateContentTime: problem.updateContentTime,
        isHiddenUploadedByZip: problem.isHiddenUploadedByZip,
        isSampleUploadedByZip: problem.isSampleUploadedByZip
      }
    })

    const total = await this.prisma.contestProblem.count({
      where: {
        contestId
      }
    })

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
   * @param {number} contestId contest의 id
   * @param {number} problemId 문제의 id
   * @param {number} userId 요청 유저의 id
   * @returns {RelatedProblemResponseDto} problem: 대회 문제 정보, order: 대회 문제 순서
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -운영진 권한이 없는 유저가 콘테스트 시작 전/종료 후 문제에 접근하려는 경우
   * -등록하지 않은 유저가 문제에 접근하려는 경우
   * @throws {Prisma.PrismaClientKnownRequestError} 아래와 같은 경우 발생할 수 있습니다.
   * -contestId/problemId에 해당하는 ContestProblem이 존재하지 않는 경우
   */
  async getContestProblem({
    contestId,
    problemId,
    userId
  }: {
    contestId: number
    problemId: number
    userId: number
  }) {
    const contest = await this.contestService.getContest(contestId, userId)
    const now = new Date()
    if (!contest.isPrivilegedRole) {
      if (contest.isRegistered) {
        if (now < contest.startTime!) {
          throw new ForbiddenAccessException(
            'Cannot access to ContestProblem before the Contest starts'
          )
        } else if (now > contest.endTime!) {
          throw new ForbiddenAccessException(
            'Cannot access to ContestProblem after the Contest ends'
          )
        }
      } else {
        throw new ForbiddenAccessException('Register to access this Problem')
      }
    }

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
          select: {
            ...problemSelectOption,
            problemTestcase: {
              where: {
                isOutdated: false,
                ...(!contest.isPrivilegedRole && { isHidden: false })
              },
              select: {
                id: true,
                input: true,
                output: true,
                isHidden: true
              }
            }
          }
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
      'problemTag',
      'submission',
      'updateTime',
      'visibleLockTime'
    ]

    const problem = { ...data.problem } // 원본 객체를 복사해서 안전하게 작업
    excludedFields.forEach((key) => {
      delete problem[key]
    })

    const updateHistory = await this.getContestProblemUpdateHistory({
      contestId,
      problemId,
      userId
    })

    return {
      order: data.order,
      problem: {
        ...problem,
        tags
      },
      updateHistory
    }
  }

  /**
   * 특정 contest의 특정 문제에 대한 업데이트 히스토리를 최신순으로 조회합니다.
   *
   * @param {number} contestId contest의 id
   * @param {number} problemId 문제의 id
   * @param {number} userId 요청 유저의 id
   * @returns {updateHistory} 업데이트 히스토리 목록
   */
  async getContestProblemUpdateHistory({
    contestId,
    problemId,
    userId
  }: {
    contestId: number
    problemId: number
    userId: number
  }) {
    const contest = await this.contestService.getContest(contestId, userId)

    // 업데이트 히스토리 조회
    const updateHistory = await this.prisma.updateHistory.findMany({
      where: {
        problemId,
        updatedAt: {
          gte: contest.startTime,
          lte: contest.endTime
        }
      },
      orderBy: { updatedAt: 'desc' } // 최신순 정렬
    })

    // if (!updateHistory.length) {
    //   throw new NotFoundException('No update history found for this problem.')
    // }

    return updateHistory
  }
}

@Injectable()
export class AssignmentProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assignmentService: AssignmentService
  ) {}

  /**
   * 주어진 옵션에 따라 과제 문제를 여러개 가져옵니다.
   *
   * 액세스 정책
   *
   * 과제 시작 전: 문제 액세스 불가 (Register 안하면 에러 메시지가 다름) //
   * 과제 진행 중: Participate한 경우 문제 액세스 가능 //
   * 과제 종료 후: Participate한 경우 문제 액세스 가능
   * @param {number} assignmentId 과제의 id
   * @param {number} userId 요청 유저의 id
   * @param {number | null} cursor 커서 값
   * @param {number} take 가져올 문제 개수
   * @returns {RelatedProblemsResponseDto} data: 과제 문제 목록, total: 과제 문제 총 개수
   */
  async getAssignmentProblems({
    assignmentId,
    userId,
    cursor,
    take
  }: {
    assignmentId: number
    userId: number
    cursor: number | null
    take: number
  }) {
    await this.assignmentService.getAssignment(assignmentId, userId) // course 멤버인지, onGoing인지 확인

    const paginator = this.prisma.getPaginator(cursor, (value) => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      assignmentId_problemId: {
        assignmentId,
        problemId: value
      }
    }))

    const assignmentProblems = await this.prisma.assignmentProblem.findMany({
      ...paginator,
      take,
      orderBy: { order: 'asc' },
      where: {
        assignmentId
      },
      select: {
        order: true,
        problem: {
          select: problemsSelectOption
        },
        problemId: true,
        score: true
      }
    })

    const assignmentProblemsWithScore = assignmentProblems.map(
      (assignmentProblem) => {
        const { problem, order } = assignmentProblem
        return {
          order,
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          submissionCount: problem.submissionCount,
          acceptedRate: problem.acceptedRate,
          maxScore: assignmentProblem.score
        }
      }
    )

    const total = assignmentProblems.length

    return {
      data: assignmentProblemsWithScore,
      total
    }
  }

  /**
   * 특정 과제 문제를 가져옵니다.
   *
   * 액세스 정책
   *
   * 대회 시작 전: 문제 액세스 불가 (Register 안하면 에러 메시지가 다름) //
   * 대회 진행 중: Register한 경우 문제 액세스 가능 //
   * 대회 종료 후: 누구나 문제 액세스 가능
   * @param {number} assignmentId 과제의 id
   * @param {number} problemId 문제의 id
   * @param {number} userId 요청 유저의 id
   * @returns {RelatedProblemResponseDto} problem: 과제 문제 정보, order: 과제 문제 순서
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -과제가 종료된 이후 해당 과제 문제에 접근하려는 경우
   * @throws {Prisma.PrismaClientKnownRequestError} 아래와 같은 경우 발생할 수 있습니다.
   * -assignmentId/problemId에 해당하는 AssignmentProblem이 존재하지 않는 경우
   */
  async getAssignmentProblem({
    assignmentId,
    problemId,
    userId
  }: {
    assignmentId: number
    problemId: number
    userId: number
  }) {
    const assignment = await this.assignmentService.getAssignment(
      assignmentId,
      userId
    )
    const now = new Date()

    if (now > assignment.endTime!) {
      throw new ForbiddenAccessException(
        'Cannot access to AssignmentProblem after the Assignment ends'
      )
    }

    const data = await this.prisma.assignmentProblem.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        assignmentId_problemId: {
          assignmentId,
          problemId
        }
      },
      select: {
        order: true,
        solutionReleaseTime: true,
        problem: {
          select: { ...problemSelectOption, solution: true }
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

    if (!data.solutionReleaseTime || now < data.solutionReleaseTime) {
      excludedFields.push('solution')
    }

    const problem = { ...data.problem } // 원본 객체를 복사해서 안전하게 작업
    excludedFields.forEach((key) => {
      delete problem[key]
    })

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

  /**
   * 특정 워크북에 포함된 문제 목록을 조회합니다.
   *
   * @param {number} workbookId workbook의 id
   * @param {number} cursor 커서 값
   * @param {number} take 가져올 문제 개수
   * @param {number | null} groupId 그룹의 id
   * @returns data:워크북 문제 목록 total:전체 개수
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -해당 그룹이 워크북에 접근할 수 없는 경우
   */
  async getWorkbookProblems({
    workbookId,
    cursor,
    take,
    groupId
  }: {
    workbookId: number
    cursor: number | null
    take: number
    groupId: number
  }) {
    const isVisible = await this.workbookService.isVisible(workbookId, groupId)
    if (!isVisible) {
      throw new ForbiddenAccessException('Cannot access to this Workbook')
    }

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

    const total = await this.prisma.workbookProblem.count({
      where: {
        workbookId,
        problem: {
          visibleLockTime: MIN_DATE
        }
      }
    })

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
      'visibleLockTime',
      'solution'
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

  /**
   * 특정 워크북에 포함된 특정 문제를 조회합니다.
   *
   * @param {number} workbookId workbook의 id
   * @param {number} problemId 문제의 id
   * @param {number} groupId 그룹의 id
   * @returns {RelatedProblemResponseDto} 워크북 문제의 상세 정보
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * -해당 그룹이 워크북에 접근할 수 없는 경우
   * @throws {Prisma.PrismaClientKnownRequestError} 아래와 같은 경우 발생할 수 있습니다.
   * -workbookId/problemId에 해당하는 WorkbookProblem이 존재하지 않는 경우
   */
  async getWorkbookProblem(
    workbookId: number,
    problemId: number,
    groupId: number
  ): Promise<RelatedProblemResponseDto> {
    const isVisible = await this.workbookService.isVisible(workbookId, groupId)
    if (!isVisible) {
      throw new ForbiddenAccessException('Cannot access to this Workbook')
    }

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
      'visibleLockTime',
      'solution'
    ]
    const problem = { ...data.problem }
    excludedFields.forEach((key) => {
      delete problem[key]
    })

    return {
      order: data.order,
      problem: {
        ...problem,
        tags
      }
    }
  }
}
