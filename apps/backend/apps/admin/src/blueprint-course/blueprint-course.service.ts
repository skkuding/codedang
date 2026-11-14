import { Injectable } from '@nestjs/common'
import type { AuthenticatedUser } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from './blueprint-access.service'
import type { BlueprintCourseInput } from './model/blueprint-course.input'

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
   * Returns Blueprint courses created or led by the user,
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
   * Returns detailed Blueprint course information and all sections.
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
}
