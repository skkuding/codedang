import { IsEmail } from 'class-validator'

export class UserEmailDto {
  @IsEmail()
  email: string
}
