import { IsBoolean, IsInt, IsNotEmpty } from 'class-validator'

export class CreateMemberDto {
  @IsInt()
  @IsNotEmpty()
  readonly user_id: number

  @IsBoolean()
  @IsNotEmpty()
  readonly is_group_manager: boolean
}
