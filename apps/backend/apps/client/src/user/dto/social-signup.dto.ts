import { Provider } from '@prisma/client'
import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  Matches,
  IsNumberString,
  IsString,
  IsOptional
} from 'class-validator'

export class SocialSignUpDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  readonly username: string

  @Matches(/^[가-힣a-zA-Z \s]+$/)
  @IsNotEmpty()
  readonly realName: string

  @IsEmail()
  @IsNotEmpty()
  readonly email: string

  @IsNotEmpty()
  readonly provider: Provider

  @IsNotEmpty()
  readonly id: string // github, kakao 등에서 로그인 시 받아오게 되는 고유 id

  @IsNumberString()
  @IsOptional()
  readonly studentId?: string

  @IsString()
  @IsOptional()
  readonly major?: string
}
