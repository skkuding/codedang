import { Controller } from '@nestjs/common'
import { WorkbookService } from './workbook.service'

@Controller('workbook')
export class WorkbookController {
  constructor(private readonly workbookService: WorkbookService) {}
}
