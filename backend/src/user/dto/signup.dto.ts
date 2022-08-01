import {
  IsAlpha,
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString
} from 'class-validator'

export class SignUpDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  readonly username: string

  @IsString()
  @IsNotEmpty()
  readonly password: string

  @IsEmail()
  @IsNotEmpty()
  readonly email: string

  @IsAlpha()
  @IsNotEmpty()
  readonly real_name: string
}
