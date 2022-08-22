import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateContestToPublicRequestDto {
  @IsNumber()
  @IsNotEmpty()
  readonly contestId: number

  @IsString()
  @IsNotEmpty()
  readonly message: string
}
