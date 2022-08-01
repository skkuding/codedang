import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserEmailDto {
  @IsString()
  @IsNotEmpty()
  readonly authCode: string

  @IsEmail()
  @IsNotEmpty()
  readonly email: string
}
