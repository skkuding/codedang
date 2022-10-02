import { IsString, IsEmail } from 'class-validator'

export class PasswordResetPinDto {
  @IsString()
  pin: string
  @IsEmail()
  email: string
}
