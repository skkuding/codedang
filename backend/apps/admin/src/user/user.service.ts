import { Injectable } from '@nestjs/common'
import { type UserCreateInput } from '../@generated/user/user-create.input'
import { type UserUpdateInput } from '../@generated/user/user-update.input'

@Injectable()
export class AdminUserService {
  async getAllUsers() {
    // return await this.prisma.user.findAll()
    return 'get all users'
  }

  async getUser(id: number) {
    // return await this.prisma.user.findUnique({
    //   where: {
    //     id: id
    //   }
    // })
    return 'get user'
  }

  async updateUser(id: number, userUpdateInput: UserUpdateInput) {
    // return await this.prisma.user.update({
    //   where: {
    //     id: id
    //   },
    //   update: {
    //     userUpdateInput
    //   }
    // })
    return 'update user'
  }

  async deleteUser(id: number) {
    //   return await this.prisma.user.delete({
    //     where: {
    //       id: id
    //     }
    //   })
    // }
    return 'delete user'
  }
}
