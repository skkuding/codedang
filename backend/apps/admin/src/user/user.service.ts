import { Injectable } from '@nestjs/common'
import { type UserCreateInput } from '../@generated/user/user-create.input'
import { type UserUpdateInput } from '../@generated/user/user-update.input'

@Injectable()
export class UserService {
  create(userCreateInput: UserCreateInput) {
    return 'This action adds a new user'
  }

  findAll() {
    return `This action returns all user`
  }

  findOne(id: number) {
    return `This action returns a #${id} user`
  }

  update(id: number, userUpdateInput: UserUpdateInput) {
    return `This action updates a #${id} user`
  }

  remove(id: number) {
    return `This action removes a #${id} user`
  }
}
