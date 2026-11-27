import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { AuthenticatedUser } from '@libs/auth'
import {
  ConflictFoundException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from './blueprint-access.service'
import type {
  BlueprintCourseInput,
  UpdateBlueprintCourseInput
} from './model/blueprint-course.input'

/**
 * Blueprint에서만 수정하고 모든 Section의 CourseInfo로 단방향 동기화하는 공통 필드입니다.
 * courseTitle은 Blueprint에만 저장하므로 포함하지 않습니다.
 */
const SECTION_COMMON_FIELDS = [
  'courseNum',
  'semester',
  'week',
  'professor',
  'email',
  'website',
  'office',
  'phoneNum'
] as const

/**
 * 입력에서 생략된(undefined) 필드만 제외합니다. null은 "값 삭제"이므로 유지합니다.
 */
const pickProvided = <T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[]
): Partial<Pick<T, K>> => {
  const picked: Partial<Pick<T, K>> = {}
  for (const key of keys) {
    if (source[key] !== undefined) {
      picked[key] = source[key]
    }
  }
  return picked
}

@Injectable()
export class BlueprintCourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blueprintAccessService: BlueprintAccessService
  ) {}

  /**
   * Blueprint 강좌를 생성합니다. Section은 만들지 않습니다.
   *
   * @param input - Blueprint 강좌 정보
   * @param user - 요청한 사용자. Blueprint 생성자(createdById)로 저장됩니다
   * @returns 생성된 Blueprint 강좌
   *
   * @throws EntityNotExistException - 사용자가 존재하지 않는 경우
   * @throws ForbiddenAccessException - 사용자가 강좌 생성 권한(canCreateCourse)을 가지고 있지 않은 경우
   */
  async createBlueprintCourse(
    input: BlueprintCourseInput,
    user: AuthenticatedUser
  ) {
    await this.blueprintAccessService.assertCanCreateCourse(user.id)

    return await this.prisma.blueprintCourse.create({
      data: {
        courseTitle: input.courseTitle,
        courseNum: input.courseNum,
        semester: input.semester,
        week: input.week,
        professor: input.professor,
        email: input.email,
        website: input.website,
        office: input.office,
        phoneNum: input.phoneNum,
        createdById: user.id
      }
    })
  }

  /**
   * @return Blueprint courses created or led by the user,
   * including all sections and their member counts.
   */
  async getBlueprintCourses(userId: number) {
    const blueprintCourses = await this.prisma.blueprintCourse.findMany({
      where: {
        OR: [
          { createdById: userId },
          {
            courseInfo: {
              some: {
                group: {
                  userGroup: {
                    some: { userId, isGroupLeader: true }
                  }
                }
              }
            }
          }
        ]
      },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        courseTitle: true,
        courseNum: true,
        semester: true,
        courseInfo: {
          orderBy: { classNum: 'asc' },
          select: {
            group: {
              include: {
                courseInfo: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                _count: {
                  select: { userGroup: true }
                }
              }
            }
          }
        }
      }
    })

    return blueprintCourses.map(({ courseInfo, ...blueprintCourse }) => ({
      ...blueprintCourse,
      sections: courseInfo.map(({ group }) => ({
        ...group,
        memberNum: group._count.userGroup
      }))
    }))
  }

  /**
   * @return detailed Blueprint course information and all sections.
   *
   * @throws EntityNotExistException - The Blueprint course does not exist.
   * @throws ForbiddenAccessException - The user cannot access the course.
   */
  async getBlueprintCourse(blueprintCourseId: number, user: AuthenticatedUser) {
    await this.blueprintAccessService.assertBlueprintLeader(
      user,
      blueprintCourseId
    )

    const blueprintCourse = await this.prisma.blueprintCourse.findUnique({
      where: { id: blueprintCourseId },
      include: {
        courseInfo: {
          orderBy: { classNum: 'asc' },
          select: {
            group: {
              include: {
                courseInfo: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                _count: {
                  select: { userGroup: true }
                }
              }
            }
          }
        }
      }
    })

    if (!blueprintCourse) {
      throw new EntityNotExistException('BlueprintCourse')
    }

    const { courseInfo, ...details } = blueprintCourse

    return {
      ...details,
      sections: courseInfo.map(({ group }) => ({
        ...group,
        memberNum: group._count.userGroup
      }))
    }
  }

  /**
   * Blueprint 강좌를 수정하고, 입력된 공통 필드를 모든 Section의 CourseInfo에 반영합니다.
   *
   * - 입력에 있는 필드만 수정합니다. null은 선택 필드의 값을 지웁니다.
   * - courseTitle은 Blueprint에만 저장하고, Section 고유 필드(groupName, classNum, config)는 바꾸지 않습니다.
   * - Blueprint 수정과 Section 반영은 하나의 transaction이라 함께 성공하거나 함께 롤백됩니다.
   *   Blueprint 행을 먼저 수정해 행 잠금을 잡고, course_info는 그다음에 수정합니다.
   *
   * @returns 수정된 Blueprint 강좌
   * @throws BadRequestException - 수정할 필드가 하나도 없는 경우
   * @throws EntityNotExistException - Blueprint가 존재하지 않는 경우
   * @throws ForbiddenAccessException - Blueprint leader가 아닌 경우
   */
  async updateBlueprintCourse(
    blueprintCourseId: number,
    input: UpdateBlueprintCourseInput,
    user: AuthenticatedUser
  ) {
    const sectionData = pickProvided(input, SECTION_COMMON_FIELDS)
    const blueprintData = {
      ...pickProvided(input, ['courseTitle'] as const),
      ...sectionData
    }
    if (Object.keys(blueprintData).length === 0) {
      throw new BadRequestException('At least one field must be provided')
    }

    await this.blueprintAccessService.assertBlueprintLeader(
      user,
      blueprintCourseId
    )

    const updateBlueprint = this.prisma.blueprintCourse.update({
      where: { id: blueprintCourseId },
      data: blueprintData
    })

    if (Object.keys(sectionData).length === 0) {
      return await updateBlueprint
    }

    const [updated] = await this.prisma.$transaction([
      updateBlueprint,
      this.prisma.courseInfo.updateMany({
        where: { blueprintCourseId },
        data: sectionData
      })
    ])
    return updated
  }

  /**
   * Section이 없는 Blueprint 강좌를 삭제합니다.
   *
   * - Section이 하나라도 있으면 삭제하지 않습니다. Section은 기존 강좌 삭제로 먼저 지워야 합니다.
   * - BlueprintAssignment와 BlueprintAssignmentProblem은 FK CASCADE로 함께 삭제됩니다.
   * - 확인 이후 Section이 동시에 생성되면 course_info FK(RESTRICT)가 삭제를 막습니다.
   *   이때 Section이 실제로 있는지 다시 확인해 409로 바꾸고, 다른 FK 오류는 그대로 전달합니다.
   *
   * @returns 삭제된 Blueprint 강좌
   * @throws EntityNotExistException - Blueprint가 존재하지 않는 경우
   * @throws ForbiddenAccessException - Blueprint leader가 아닌 경우
   * @throws ConflictFoundException - Blueprint에 Section이 있는 경우
   */
  async deleteBlueprintCourse(
    blueprintCourseId: number,
    user: AuthenticatedUser
  ) {
    await this.blueprintAccessService.assertBlueprintLeader(
      user,
      blueprintCourseId
    )
    await this.assertNoSection(blueprintCourseId)

    try {
      return await this.prisma.blueprintCourse.delete({
        where: { id: blueprintCourseId }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        await this.assertNoSection(blueprintCourseId)
      }
      throw error
    }
  }

  private async assertNoSection(blueprintCourseId: number) {
    const sectionCount = await this.prisma.courseInfo.count({
      where: { blueprintCourseId }
    })
    if (sectionCount > 0) {
      throw new ConflictFoundException(
        'Cannot delete a blueprint course that has sections'
      )
    }
  }
}
