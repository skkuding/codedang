import { Injectable } from '@nestjs/common'
import type {
  Problem,
  ProblemTag,
  Submission,
  Tag,
  UserProblem
} from '@prisma/client'
import type { JsonArray } from '@prisma/client/runtime/library'
import { ConflictFoundException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { Template } from '@client/submission/dto/create-submission.dto'

/**
 * repository에서는 partial entity를 반환합니다.
 * 반환된 data를 service에서 class-transformer를 사용하여 ResponseDto로 변환합니다
 *
 * repository는 ORM 쿼리를 위한 layer입니다. unit test에서는 제외하고, 통합 테스트(e2e test)에서 실제 반환값과 ResponseDto가 일치하는지 비교를 통해 검증합니다
 * https://softwareengineering.stackexchange.com/questions/185326/why-do-i-need-unit-tests-for-testing-repository-methods
 *
 */

@Injectable()
export class ProblemRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly problemsSelectOption = {
    id: true,
    title: true,
    difficulty: true
  }

  private readonly problemSelectOption = {
    ...this.problemsSelectOption,
    description: true,
    inputDescription: true,
    outputDescription: true,
    hint: true,
    languages: true,
    timeLimit: true,
    memoryLimit: true,
    source: true,
    inputExamples: true,
    outputExamples: true
  }

  private readonly relatedProblemSelectOption = {
    id: true,
    problem: {
      select: this.problemSelectOption
    }
  }

  private readonly relatedProblemsSelectOption = {
    id: true,
    problem: {
      select: this.problemsSelectOption
    }
  }

  private readonly UserProblemSelectOption = {
    id: true,
    userId: true,
    problemId: true,
    template: true,
    createTime: true,
    updateTime: true
  }

  async getProblems(
    cursor: number,
    take: number,
    groupId: number
  ): Promise<
    (Partial<Problem> & { submission: Partial<Submission>[] } & {
      problemTag: Partial<ProblemTag>[]
    })[]
  > {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.problem.findMany({
      cursor: {
        id: cursor
      },
      skip: skip,
      take: take,
      where: {
        groupId
      },
      select: {
        ...this.problemsSelectOption,
        submission: {
          select: {
            result: true
          }
        },
        problemTag: {
          select: {
            tagId: true
          }
        }
      }
    })
  }

  async getProblemTags(problemId: number): Promise<Partial<Tag>[]> {
    return (
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
  }

  async getProblem(
    problemId: number,
    groupId: number
  ): Promise<Partial<Problem>> {
    return await this.prisma.problem.findUniqueOrThrow({
      where: {
        id: problemId,
        groupId: groupId
      },
      select: this.problemSelectOption
    })
  }

  async getProblemsTags(tagIds: number[]): Promise<Partial<Tag>[]> {
    return await this.prisma.tag.findMany({
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
  }

  async getContestProblems(contestId: number, cursor: number, take: number) {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.contestProblem.findMany({
      cursor: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_problemId: {
          contestId: contestId,
          problemId: cursor
        }
      },
      skip: skip,
      take: take,
      where: { contestId: contestId },
      select: {
        order: true,
        problem: {
          select: this.problemsSelectOption
        },
        contest: {
          select: {
            startTime: true
          }
        }
      }
    })
  }

  async getContestProblem(contestId: number, problemId: number) {
    return await this.prisma.contestProblem.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_problemId: {
          contestId: contestId,
          problemId: problemId
        }
      },
      select: {
        order: true,
        problem: {
          select: this.problemSelectOption
        },
        contest: {
          select: {
            startTime: true
          }
        }
      }
    })
  }

  async getWorkbookProblems(workbookId: number, cursor: number, take: number) {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.workbookProblem.findMany({
      cursor: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workbookId_problemId: {
          workbookId: workbookId,
          problemId: cursor
        }
      },
      skip: skip,
      take: take,
      where: { workbookId: workbookId },
      select: {
        order: true,
        problem: {
          select: this.problemsSelectOption
        }
      }
    })
  }

  async getWorkbookProblem(workbookId: number, problemId: number) {
    return await this.prisma.workbookProblem.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workbookId_problemId: {
          workbookId: workbookId,
          problemId: problemId
        }
      },
      select: {
        order: true,
        problem: {
          select: this.problemSelectOption
        }
      }
    })
  }

  async getUserProblem(
    userId: number,
    problemId: number
  ): Promise<Partial<UserProblem>> {
    await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId
      }
    })
    await this.prisma.problem.findUniqueOrThrow({
      where: {
        id: problemId
      }
    })
    return await this.prisma.userProblem.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_problemId: {
          userId: userId,
          problemId: problemId
        }
      },
      select: this.UserProblemSelectOption
    })
  }

  async createUserProblem(
    userId: number,
    // Template class를 submisison에서 가져오는 것은 좋지 않은 방법이지만, 현재는 이 방법밖에 없습니다.
    template: Template[],
    problemId: number
  ): Promise<Partial<UserProblem>> {
    await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId
      }
    })
    await this.prisma.problem.findUniqueOrThrow({
      where: {
        id: problemId
      }
    })
    await this.prisma.userProblem
      .findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_problemId: {
            userId: userId,
            problemId: problemId
          }
        }
      })
      .then((userProblem) => {
        if (userProblem) {
          throw new ConflictFoundException('UserProblem')
        }
      })
    return await this.prisma.userProblem.create({
      data: {
        userId: userId,
        problemId: problemId,
        template: template as unknown as JsonArray
      },
      select: this.UserProblemSelectOption
    })
  }

  async updateUserProblem(
    userId: number,
    // Template class를 submisison에서 가져오는 것은 좋지 않은 방법이지만, 현재는 이 방법밖에 없습니다.
    template: Template[],
    problemId: number
  ): Promise<Partial<UserProblem>> {
    await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId
      }
    })
    await this.prisma.problem.findUniqueOrThrow({
      where: {
        id: problemId
      }
    })
    return await this.prisma.userProblem.update({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_problemId: {
          userId: userId,
          problemId: problemId
        }
      },
      data: {
        template: template as unknown as JsonArray
      },
      select: this.UserProblemSelectOption
    })
  }
}
