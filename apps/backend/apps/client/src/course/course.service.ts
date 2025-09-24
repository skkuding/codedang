// apps/backend/apps/client/src/course/course.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  // Course 관련 비즈니스 로직
}
