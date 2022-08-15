import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Req
} from '@nestjs/common'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { CreatePublicProblemSubmissionDto } from './dto/createPublicProblemSubmission.dto'
import { SubmissionService } from './submission.service'

@Controller()
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post('problem/:problem_id/submission')
  async createPublicProblemSubmission(
    @Req() req: AuthenticatedRequest,
    @Body() createPublicProblemSubmissionDto: CreatePublicProblemSubmissionDto
  ) {
    try {
      await this.submissionService.createPublicProblemSubmission(
        req.user.id,
        req.ip.slice(7),
        createPublicProblemSubmissionDto
      )
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }
}
