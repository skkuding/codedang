import { RequestStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty } from 'class-validator'

export class RespondContestToPublicRequestDto {
  @IsEnum({
    accepted: RequestStatus.Accepted,
    rejected: RequestStatus.Rejected
  })
  @IsNotEmpty()
  readonly requestStatus: RequestStatus
}
