import { IsString, IsEmail, IsNotEmpty } from 'class-validator'

export class EmailAuthensticationPinDto {
  @IsString()
  @IsNotEmpty()
  pin: string

  @IsEmail()
  @IsNotEmpty()
  email: string
}
