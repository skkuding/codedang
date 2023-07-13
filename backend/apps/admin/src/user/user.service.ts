import { Injectable } from '@nestjs/common'
import type {
  User,
  UserCreateInput,
  UserUpdateInput,
  UserWhereInput
} from '@generated'
import { PrismaService } from '@libs/prisma'

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

  async getUsers(where: UserWhereInput = {}): Promise<User[]> {
    return await this.prisma.user.findMany({
      where
    })
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
