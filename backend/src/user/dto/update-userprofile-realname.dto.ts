import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserProfileRealNameDto {
  @IsString()
  @IsNotEmpty()
  readonly realName: string
}
