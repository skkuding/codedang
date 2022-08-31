import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserEmailDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string
}
