import { IsNotEmpty, IsString } from 'class-validator'

export class SocialLinkDto {
  @IsString()
  @IsNotEmpty()
  readonly oauthToken: string
}
