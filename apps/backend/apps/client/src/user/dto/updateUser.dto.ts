import {
  IsOptional,
  IsString,
  IsNumberString,
  Matches,
  IsUrl
} from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly password?: string

  @IsOptional()
  @IsString()
  readonly newPassword?: string

  @IsOptional()
  @Matches(/^[가-힣a-zA-Z \s]+$/)
  @IsString()
  readonly realName?: string

  @IsOptional()
  @IsString()
  readonly nickname?: string

  @IsOptional()
  @IsUrl()
  readonly profileImageUrl?: string

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
