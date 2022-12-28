import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateContestPublicizingRequestDto {
  @IsNumber()
  @IsNotEmpty()
  readonly contestId: number

  @IsString()
  @IsNotEmpty()
  readonly message: string
}
