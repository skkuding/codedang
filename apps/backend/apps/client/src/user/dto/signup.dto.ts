import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Matches
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

  @Matches(/^[a-zA-Z\s]+$/)
  @IsNotEmpty()
  readonly realName: string

  @IsNumberString()
  @IsNotEmpty()
  readonly studentID: string | null

  @IsString()
  @IsNotEmpty()
  readonly major: string | null
}
