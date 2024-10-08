/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common'
import {
  type Problem,
  type Tag,
  type CodeDraft,
  Prisma,
  ResultStatus
} from '@prisma/client'
import { Span } from 'nestjs-otel'
import { MIN_DATE } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type {
  CodeDraftCreateInput,
  CodeDraftUpdateInput
} from '@admin/@generated'
import type { CreateTemplateDto } from './dto/create-code-draft.dto'
import type { ProblemOrder } from './enum/problem-order.enum'

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

  private readonly problemsSelectOption: Prisma.ProblemSelect = {
    id: true,
    title: true,
    engTitle: true,
    difficulty: true,
    acceptedRate: true,
    submissionCount: true,
    languages: true
  }

  private readonly problemSelectOption: Prisma.ProblemSelect = {
    ...this.problemsSelectOption,
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

  private readonly codeDraftSelectOption = {
    userId: true,
    problemId: true,
    template: true,
    createTime: true,
    updateTime: true
  }

  async getProblems({
    cursor,
    take,
    groupId,
    order,
    search
  }: {
    cursor: number | null
    take: number
    groupId: number
    order?: ProblemOrder
    search?: string
  }) {
    const paginator = this.prisma.getPaginator(cursor)

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

    const orderBy = orderByMapper[order ?? 'id-asc']

    return await this.prisma.problem.findMany({
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
        ...this.problemsSelectOption,
        problemTag: {
          select: {
            tagId: true
          }
        }
      }
    })
  }

  async getProblemTotalCount(groupId: number, search?: string) {
    return await this.prisma.problem.count({
      where: {
        groupId,
        title: {
          // TODO: 검색 방식 변경 시 함께 변경 요함
          contains: search
        },
        visibleLockTime: MIN_DATE
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
    const problem = await this.prisma.problem.findUnique({
      where: {
        id: problemId,
        groupId,
        visibleLockTime: MIN_DATE
      },
      select: this.problemSelectOption
    })
    if (!problem) {
      throw new EntityNotExistException('Problem')
    }
    return problem
  }

  async getProblemsTags(tagIds: number[]) {
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

  async getContestProblems(
    contestId: number,
    cursor: number | null,
    take: number
  ) {
    const paginator = this.prisma.getPaginator(cursor, (value) => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      contestId_problemId: {
        contestId,
        problemId: value
      }
    }))

    return await this.prisma.contestProblem.findMany({
      ...paginator,
      take,
      orderBy: { order: 'asc' },
      where: {
        contestId
      },
      select: {
        order: true,
        problem: {
          select: this.problemsSelectOption
        },
        problemId: true,
        score: true
      }
    })
  }

  async getContestProblemTotalCount(contestId: number) {
    return await this.prisma.contestProblem.count({
      where: {
        contestId
      }
    })
  }

  async getContestProblem(contestId: number, problemId: number) {
    const contestProblem = await this.prisma.contestProblem.findUnique({
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
          select: this.problemSelectOption
        }
      }
    })
    if (!contestProblem) {
      throw new EntityNotExistException('ContestProblem')
    }
    return contestProblem
  }

  async getWorkbookProblems(
    workbookId: number,
    cursor: number | null,
    take: number
  ) {
    const paginator = this.prisma.getPaginator(cursor, (value) => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      workbookId_problemId: {
        workbookId,
        problemId: value
      }
    }))

    return await this.prisma.workbookProblem.findMany({
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
          select: this.problemsSelectOption
        }
      }
    })
  }

  async getWorkbookProblemTotalCount(workbookId: number) {
    return await this.prisma.workbookProblem.count({
      where: {
        workbookId,
        problem: {
          visibleLockTime: MIN_DATE
        }
      }
    })
  }

  async getWorkbookProblem(workbookId: number, problemId: number) {
    const workbookProblem = await this.prisma.workbookProblem.findUnique({
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
          select: this.problemSelectOption
        }
      }
    })
    if (!workbookProblem) {
      throw new EntityNotExistException('WorkbookProblem')
    }
    return workbookProblem
  }

  async getCodeDraft(
    userId: number,
    problemId: number
  ): Promise<Partial<CodeDraft>> {
    const codeDraft = await this.prisma.codeDraft.findUnique({
      where: {
        codeDraftId: {
          userId,
          problemId
        }
      },
      select: this.codeDraftSelectOption
    })
    if (!codeDraft) {
      throw new EntityNotExistException('CodeDraft')
    }
    return codeDraft
  }

  async upsertCodeDraft(
    userId: number,
    problemId: number,
    template: CreateTemplateDto
  ): Promise<Partial<CodeDraft>> {
    try {
      return await this.prisma.codeDraft.upsert({
        where: {
          codeDraftId: {
            userId,
            problemId
          }
        },
        update: {
          template: template.template as CodeDraftUpdateInput['template']
        },
        create: {
          userId,
          problemId,
          template: template.template as CodeDraftCreateInput['template']
        },
        select: this.codeDraftSelectOption
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
  }

  @Span()
  async hasPassedProblem(
    userId: number,
    where: { problemId: number; contestId?: number }
  ): Promise<boolean | null> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        ...where,
        userId
      },
      select: { result: true }
    })

    return submissions.length
      ? submissions.some(
          (submission) => submission.result === ResultStatus.Accepted
        )
      : null
  }
}
