import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UserCreateInput } from '../@generated/user/user-create.input'
import { UserUpdateInput } from '../@generated/user/user-update.input'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userCreateInput: UserCreateInput) {
    return this.prisma.user.create({ data: userCreateInput })
  }

  async findAll() {
    return this.prisma.user.findMany()
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async update(id: number, userUpdateInput: UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data: userUpdateInput
    })
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } })
  }
}
