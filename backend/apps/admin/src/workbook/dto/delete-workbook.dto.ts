import { IsNotEmpty, IsNumber } from 'class-validator'

export class DeleteWorkbookDto {
  @IsNumber()
  @IsNotEmpty()
  groupId: number

  @IsNumber()
  @IsNotEmpty()
  id: number
}
