import { IsNotEmpty, IsNumber } from 'class-validator'

export class GetWorkbookDto {
  @IsNumber()
  @IsNotEmpty()
  groupId: number
  @IsNumber()
  @IsNotEmpty()
  cursor: number
  @IsNumber()
  @IsNotEmpty()
  take: number
}
