import { Provider } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { LoginUserDto } from './login-user.dto'

export class SocialLinkDto extends LoginUserDto {
  @IsEnum(Provider)
  @IsNotEmpty()
  readonly provider: Provider

  @IsString()
  @IsNotEmpty()
  readonly oauthId: string
}
