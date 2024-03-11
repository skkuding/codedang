import { IsString, IsEmail, IsNotEmpty } from 'class-validator'

export class EmailAuthenticationPinDto {
  @IsString()
  @IsNotEmpty()
  pin: string

  @IsEmail()
  @IsNotEmpty()
  email: string
}
