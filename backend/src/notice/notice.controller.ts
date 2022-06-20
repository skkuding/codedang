import { Controller, Inject } from '@nestjs/common'
import { NoticeService } from './notice.service'

@Controller('notice')
export class NoticeController {
  constructor(
    @Inject('notice') private readonly noticeService: NoticeService
  ) {}
}
