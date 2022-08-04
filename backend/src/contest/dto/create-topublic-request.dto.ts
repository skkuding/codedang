import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateContestToPublicRequestDto {
  @IsNumber()
  @IsNotEmpty()
  readonly contest_id: number

  @IsString()
  @IsNotEmpty()
  readonly message: string
}
