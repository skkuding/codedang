// apps/backend/apps/client/src/course/course.module.ts
import { Module } from '@nestjs/common'
import { CourseController } from './course.controller'
import { CourseService } from './course.service'

@Module({
  controllers: [CourseController],
  providers: [CourseService]
})
export class CourseModule {}
