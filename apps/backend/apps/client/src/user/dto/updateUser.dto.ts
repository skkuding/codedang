import { IsOptional, IsString, IsNumberString, Matches } from 'class-validator'

export class UpdateUserDto {
  @IsString()
  readonly password: string

  @IsOptional()
  @IsString()
  readonly newPassword?: string

  @IsOptional()
  @Matches(/^[a-zA-Z\s]+$/)
  @IsString()
  readonly realName?: string

  @IsOptional()
  @IsNumberString()
  readonly studentId?: string

  @IsOptional()
  @IsString()
  readonly major?: string
}
