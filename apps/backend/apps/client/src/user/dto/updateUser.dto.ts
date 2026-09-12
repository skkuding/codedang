import { IsEmpty, IsOptional, IsString, Matches } from 'class-validator'

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

  // Student IDs are intentionally immutable after sign-up
  // to keep whitelist matching reliable.
  @IsEmpty({ message: 'studentId cannot be updated' })
  readonly studentId?: never

  @IsOptional()
  @IsString()
  readonly college?: string

  @IsOptional()
  @IsString()
  readonly major?: string
}
