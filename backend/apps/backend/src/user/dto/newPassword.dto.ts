import { IsString } from 'class-validator'

export class NewPasswordDto {
  @IsString()
  newPassword: string
}
