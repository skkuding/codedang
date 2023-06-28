import { IsString, IsBoolean, IsNotEmpty } from 'class-validator'

export class UpdateWorkbookDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsBoolean()
  @IsNotEmpty() // TODO: 떼기
  isVisible: boolean
}
