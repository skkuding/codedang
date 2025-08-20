import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
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

  @Matches(/^[가-힣a-zA-Z \s]+$/)
  @IsNotEmpty()
  readonly realName: string

  @IsOptional()
  @IsNumberString()
  readonly studentId?: string

  @IsOptional()
  @IsString()
  readonly college?: string

  @IsOptional()
  @IsString()
  readonly major?: string
}
