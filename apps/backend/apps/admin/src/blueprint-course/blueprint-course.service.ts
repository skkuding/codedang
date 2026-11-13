import { Injectable } from '@nestjs/common'
import type { AuthenticatedUser } from '@libs/auth'
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
}
