import { RequestStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty } from 'class-validator'

export class RespondContestToPublicRequestDto {
  @IsEnum({ Accept: RequestStatus.Accept, Reject: RequestStatus.Reject })
  @IsNotEmpty()
  readonly request_status: RequestStatus
}
