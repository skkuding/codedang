import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { User } from '@admin/@generated/user/user.model'
import type { UserCreateInput } from '../@generated/user/user-create.input'
import type { UserUpdateInput } from '../@generated/user/user-update.input'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userCreateInput: UserCreateInput) {
    return await this.prisma.user.create({
      data: {
        username: userCreateInput.username,
        password: userCreateInput.password,
        email: userCreateInput.email
      }
    })
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany()
  }

  async getUser(id: number): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        id: id
      }
    })
  }

  async updateUser(
    id: number,
    userUpdateInput: UserUpdateInput
  ): Promise<User> {
    return await this.prisma.user.update({
      where: {
        id: id
      },
      data: {
        username: userUpdateInput.username,
        password: userUpdateInput.password,
        email: userUpdateInput.email
      }
    })
  }

  async deleteUser(id: number): Promise<User> {
    return await this.prisma.user.delete({
      where: {
        id: id
      }
    })
  }
}
