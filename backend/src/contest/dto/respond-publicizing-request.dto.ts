import { IsBoolean, IsNotEmpty } from 'class-validator'

export class RespondContestPublicizingRequestDto {
  @IsBoolean()
  @IsNotEmpty()
  readonly accepted: boolean
}
