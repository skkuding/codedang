import { Injectable } from '@nestjs/common'
import type { PrismaService } from '@libs/prisma'
import type { CreateAnnouncementInput } from './dto/create-announcement.input'
import type { UpdateAnnouncementInput } from './dto/update-announcement.input'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAnnouncementInput: CreateAnnouncementInput) {
    return this.prisma.announcement.create({
      data: createAnnouncementInput
    })
  }

  findAll() {
    return `This action returns all announcement`
  }

  findOne(id: number) {
    return `This action returns a #${id} announcement`
  }

  update(id: number, updateAnnouncementInput: UpdateAnnouncementInput) {
    return this.prisma.announcement.update({
      where: { id },
      data: updateAnnouncementInput
    })
  }

  remove(id: number) {
    // return `This action removes a #${id} announcement`
    return this.prisma.announcement.delete({
      where: { id }
    })
  }
}
