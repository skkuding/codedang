// apps/backend/apps/client/src/course/course.controller.ts
import { Controller } from '@nestjs/common'
import { CourseService } from './course.service'

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
}
