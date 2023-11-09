import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserProfileDto {
  @IsString()
  @IsNotEmpty()
  readonly realName: string
}
