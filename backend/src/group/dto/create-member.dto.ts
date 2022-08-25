import { IsBoolean, IsInt, IsNotEmpty } from 'class-validator'

export class CreateMemberDto {
  @IsInt()
  @IsNotEmpty()
  readonly studentId: string

  @IsBoolean()
  @IsNotEmpty()
  readonly isGroupManager: boolean
}
