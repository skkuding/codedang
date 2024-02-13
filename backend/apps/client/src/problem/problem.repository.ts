/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common'
import type { CodeDraftUpdateInput } from '@generated'
import type { Problem, Tag, CodeDraft, Prisma } from '@prisma/client'
import { PrismaService } from '@libs/prisma'
import type { CodeDraftUpdateInput } from '@admin/@generated'
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

  private readonly problemsSelectOption = {
    id: true,
    title: true,
    exposeTime: true,
    difficulty: true,
    acceptedRate: true,
    submissionCount: true
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
    acceptedCount: true,
    inputExamples: true,
    outputExamples: true
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
      Prisma.ProblemOrderByWithRelationAndSearchRelevanceInput[]
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
        }
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
        groupId
      },
      select: this.problemSelectOption
    })
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
      where: { contestId },
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

  async getContestProblemTotalCount(contestId: number) {
    return await this.prisma.contestProblem.count({
      where: {
        contestId
      }
    })
  }

  async getContestProblem(contestId: number, problemId: number) {
    return await this.prisma.contestProblem.findUniqueOrThrow({
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
        },
        contest: {
          select: {
            startTime: true
          }
        }
      }
    })
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
      where: { workbookId },
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
        workbookId
      }
    })
  }

  async getWorkbookProblem(workbookId: number, problemId: number) {
    return await this.prisma.workbookProblem.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workbookId_problemId: {
          workbookId,
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
  }

  async getCodeDraft(
    userId: number,
    problemId: number
  ): Promise<Partial<CodeDraft>> {
    return await this.prisma.codeDraft.findUniqueOrThrow({
      where: {
        codeDraftId: {
          userId,
          problemId
        }
      },
      select: this.codeDraftSelectOption
    })
  }

  async upsertCodeDraft(
    userId: number,
    problemId: number,
    template: CreateTemplateDto
  ): Promise<Partial<CodeDraft>> {
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
        template: template.template as CodeDraftUpdateInput['template']
      },
      select: this.codeDraftSelectOption
    })
  }
}
