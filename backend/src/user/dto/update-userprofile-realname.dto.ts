import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserProfileRealNameDto {
  @IsString()
  @IsNotEmpty()
  readonly real_name: string
}
