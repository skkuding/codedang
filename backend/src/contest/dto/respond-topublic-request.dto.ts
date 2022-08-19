import { RequestStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty } from 'class-validator'

export class RespondContestToPublicRequestDto {
  @IsEnum({ Accept: RequestStatus.Accepted, Reject: RequestStatus.Rejected })
  @IsNotEmpty()
  readonly request_status: RequestStatus
}
