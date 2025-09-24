// apps/backend/apps/client/src/course/course.module.ts
import { Module } from '@nestjs/common'
import { CourseController } from './course.controller'
import { CourseService } from './course.service'
import { QnaModule } from './qna/qna.module'

@Module({
  imports: [QnaModule],
  controllers: [CourseController],
  providers: [CourseService]
})
export class CourseModule {}
