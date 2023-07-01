import { IsString, IsBoolean, IsNotEmpty, IsNumber } from 'class-validator'

export class UpdateWorkbookDto {
  @IsNumber()
  @IsNotEmpty()
  groupId: number

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsBoolean()
  isVisible: boolean
}
