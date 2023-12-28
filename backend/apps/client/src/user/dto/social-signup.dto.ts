import { IsAlphanumeric, IsEmail, IsNotEmpty, Matches } from 'class-validator'
import { Provider } from '../enum/provider.enum'

export class SocialSignUpDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  readonly username: string

  @Matches(/^[a-zA-Z\s]+$/)
  @IsNotEmpty()
  readonly realName: string

  @IsEmail()
  @IsNotEmpty()
  readonly email: string

  @IsNotEmpty()
  readonly provider: Provider

  @IsNotEmpty()
  readonly id: number // github, kakao 등에서 로그인 시 받아오게 되는 고유 id
}
