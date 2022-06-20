import { Controller, Inject } from '@nestjs/common'
import { SubmissionService } from './submission.service'

@Controller('submission')
export class SubmissionController {
  constructor(
    @Inject('submission') private readonly submissionService: SubmissionService
  ) {}
}
