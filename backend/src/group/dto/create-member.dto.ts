import { IsBoolean, IsInt, IsNotEmpty } from 'class-validator'

export class CreateMemberDto {
  @IsInt()
  @IsNotEmpty()
  readonly student_id: string

  @IsBoolean()
  @IsNotEmpty()
  readonly is_group_manager: boolean
}
