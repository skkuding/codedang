import { Injectable } from '@nestjs/common'
import { CreateAnnouncementDto } from './dto/create-announcement.dto'
import { UpdateAnnouncementDto } from './dto/update-announcement.dto'

@Injectable()
export class AnnouncementService {
  create(createAnnouncementDto: CreateAnnouncementDto) {
    console.log(createAnnouncementDto)
    return 'This action adds a new announcement'
  }

  findAll() {
    return `This action returns all announcement`
  }

  findOne(id: number) {
    return `This action returns a #${id} announcement`
  }

  update(id: number, updateAnnouncementDto: UpdateAnnouncementDto) {
    console.log(updateAnnouncementDto)
    return `This action updates a #${id} announcement`
  }

  remove(id: number) {
    return `This action removes a #${id} announcement`
  }
}
