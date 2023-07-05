import { IsNotEmpty, IsNumber } from 'class-validator'
import { CreateWorkbookDto } from './create-workbook.dto'

export class UpdateWorkbookDto extends CreateWorkbookDto {
  @IsNumber()
  @IsNotEmpty()
  id: number
}
