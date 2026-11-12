import { Injectable } from '@nestjs/common'
import type { AuthenticatedUser } from '@libs/auth'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'

/**
 * Blueprint 기능의 권한을 판단합니다.
 *
 * Blueprint에는 groupId가 없어 GroupLeaderGuard를 사용할 수 없으므로,
 * Blueprint API는 resolver에 `@UseDisableAdminGuard()`를 붙이고 이 서비스로 인가합니다.
 * 다른 모듈(Blueprint 과제, 통합 표절 검사, Section 등)도 이 서비스를 재사용합니다.
 */
@Injectable()
export class BlueprintAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 강좌 생성 권한(canCreateCourse)을 확인합니다. 기존 createCourse와 같은 검사입니다.
   *
   * @throws EntityNotExistException - 사용자가 존재하지 않는 경우
   * @throws ForbiddenAccessException - canCreateCourse가 false인 경우
   */
  async assertCanCreateCourse(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { canCreateCourse: true }
    })
    if (!user) {
      throw new EntityNotExistException('User')
    }
    if (!user.canCreateCourse) {
      throw new ForbiddenAccessException('No Access to create course')
    }
  }

  /**
   * 사용자가 Blueprint leader인지 확인합니다.
   *
   * 다음 중 하나라도 해당하면 leader입니다.
   * - Admin 또는 SuperAdmin (GroupLeaderGuard와 같음)
   * - Blueprint 생성자 (Section이 없는 Blueprint도 관리할 수 있도록)
   * - 이 Blueprint에 속한 Section 중 하나의 group leader
   *
   * @throws EntityNotExistException - Blueprint가 존재하지 않는 경우
   */
  async isBlueprintLeader(
    user: AuthenticatedUser,
    blueprintCourseId: number
  ): Promise<boolean> {
    const blueprintCourse = await this.prisma.blueprintCourse.findUnique({
      where: { id: blueprintCourseId },
      select: {
        createdById: true,
        courseInfo: {
          where: {
            group: {
              userGroup: { some: { userId: user.id, isGroupLeader: true } }
            }
          },
          select: { groupId: true },
          take: 1
        }
      }
    })
    if (!blueprintCourse) {
      throw new EntityNotExistException('BlueprintCourse')
    }

    return (
      user.isAdmin() ||
      user.isSuperAdmin() ||
      blueprintCourse.createdById === user.id ||
      blueprintCourse.courseInfo.length > 0
    )
  }

  /**
   * Blueprint leader가 아니면 예외를 던집니다.
   *
   * @throws EntityNotExistException - Blueprint가 존재하지 않는 경우
   * @throws ForbiddenAccessException - Blueprint leader가 아닌 경우
   */
  async assertBlueprintLeader(
    user: AuthenticatedUser,
    blueprintCourseId: number
  ): Promise<void> {
    if (!(await this.isBlueprintLeader(user, blueprintCourseId))) {
      throw new ForbiddenAccessException(
        'Only blueprint leader can access this blueprint'
      )
    }
  }
}
