import { Module } from '@nestjs/common'
import { CourseResolver } from './course.resolver'
import { CourseService } from './course.service'

@Module({
  providers: [CourseResolver, CourseService]
})
export class CourseModule {}
