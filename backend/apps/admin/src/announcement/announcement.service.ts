import { Injectable } from '@nestjs/common'
import type { CreateAnnouncementInput } from './dto/create-announcement.input'
import type { UpdateAnnouncementInput } from './dto/update-announcement.input'

@Injectable()
export class AnnouncementService {
  create(createAnnouncementInput: CreateAnnouncementInput) {
    return createAnnouncementInput
  }

  findAll() {
    return `This action returns all announcement`
  }

  findOne(id: number) {
    return `This action returns a #${id} announcement`
  }

  update(id: number, updateAnnouncementInput: UpdateAnnouncementInput) {
    return updateAnnouncementInput
  }

  remove(id: number) {
    return `This action removes a #${id} announcement`
  }
}
