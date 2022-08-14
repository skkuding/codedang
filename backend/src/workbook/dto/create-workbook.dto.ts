import { UpdateWorkbookDto } from './update-workbook.dto'
import { IsInt } from 'class-validator'

export class CreateWorkbookDto extends UpdateWorkbookDto {
  @IsInt()
  created_by_id: number
}
