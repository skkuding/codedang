import { Controller, Inject } from '@nestjs/common'
import { WorkbookService } from './workbook.service'

@Controller('workbook')
export class WorkbookController {
  constructor(
    @Inject('workbook') private readonly workbookService: WorkbookService
  ) {}
}
