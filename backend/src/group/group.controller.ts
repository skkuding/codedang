import { Controller, Inject } from '@nestjs/common'
import { GroupService } from './group.service'

@Controller('group')
export class GroupController {
  constructor(@Inject('group') private readonly groupService: GroupService) {}
}
