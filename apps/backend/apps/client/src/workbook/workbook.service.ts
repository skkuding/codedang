import { Injectable } from '@nestjs/common'
import type { Workbook, Problem } from '@prisma/client'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 그룹에 속한 공개(isVisible) 문제집 목록을 커서 기반으로 조회합니다.
   *
   * @param {number | null} cursor 페이지네이션 커서 (마지막으로 조회한 문제집 ID)
   * @param {number} take 조회할 문제집 개수
   * @param {number} groupId 그룹 ID
   * @returns 문제집 목록(`data`)과 공개 문제집 전체 개수(`total`)
   */
  async getWorkbooksByGroupId(
    cursor: number | null,
    take: number,
    groupId: number
  ) {
    const paginator = this.prisma.getPaginator(cursor)

    const workbooks = await this.prisma.workbook.findMany({
      ...paginator,
      where: {
        groupId,
        isVisible: true
      },
      take,
      select: {
        id: true,
        title: true,
        description: true,
        updateTime: true
      }
    })

    const total = await this.prisma.workbook.count({
      where: {
        groupId,
        isVisible: true
      }
    })

    return { data: workbooks, total }
  }

  /**
   * 공개된 문제집의 정보와 포함된 문제 목록을 조회합니다.
   *
   * @param {number} workbookId 문제집 ID
   * @param {number} groupId 그룹 ID
   * @returns 문제집 ID, 제목 및 문제 목록(문제 ID, 제목, 태그 이름)
   * @throws {EntityNotExistException} 그룹에 해당 문제집이 없거나 공개되지 않은 경우 발생합니다.
   */
  async getWorkbook(
    workbookId: number,
    groupId: number
  ): Promise<Partial<Workbook> & { problems: Partial<Problem>[] }> {
    const workbook = await this.prisma.workbook.findUnique({
      where: { id: workbookId, groupId, isVisible: true },
      select: { id: true, title: true }
    })
    if (!workbook) {
      throw new EntityNotExistException('Workbook')
    }

    const rawProblems = await this.prisma.workbookProblem.findMany({
      where: { workbookId },
      select: {
        problem: {
          select: {
            id: true,
            title: true,
            problemTag: {
              select: {
                tag: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    const problems = rawProblems.map((x) => ({
      id: x.problem.id,
      title: x.problem.title,
      tags: x.problem.problemTag.map((y) => y.tag.name)
    }))

    return {
      ...workbook,
      problems
    }
  }

  /**
   * 그룹에 속한 문제집이 공개 상태인지 확인합니다.
   *
   * @param {number} id 문제집 ID
   * @param {number} groupId 그룹 ID
   * @returns 공개된 문제집이 존재하면 true, 아니면 false
   */
  async isVisible(id: number, groupId: number): Promise<boolean> {
    return !!(await this.prisma.workbook.count({
      where: { id, groupId, isVisible: true }
    }))
  }
}
