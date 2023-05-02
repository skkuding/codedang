import { Injectable } from '@nestjs/common'
import { type UserCreateInput } from '../@generated/user/user-create.input'
import { type UserUpdateInput } from '../@generated/user/user-update.input'
import { UnprocessableDataException } from '@client/common/exception/business.exception'
import { type User } from '@admin/@generated/user/user.model'
import { encrypt } from '@client/common/hash'
import { PrismaService } from '@admin/prisma/prisma.service'
import { GroupService } from '@client/group/group.service'
import { UserService } from '@client/user/user.service'
import { type CreateUserProfileData } from './interface/create-userprofile.interface'

@Injectable()
export class AdminUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly userService: UserService
  ) {}

  async create(userCreateInput: UserCreateInput) {
    // const { email } = await this.verifyJwtFromRequestHeader(req)
    // if (email != userCreateInput.email) {
    //   throw new UnprocessableDataException('The email is not authenticated one')
    // }

    const duplicatedUser: User = await this.prisma.user.findUnique({
      where: {
        username: userCreateInput.username
      }
    })
    if (duplicatedUser) {
      throw new UnprocessableDataException('Username already exists')
    }

    if (!this.userService.isValidUsername(userCreateInput.username)) {
      throw new UnprocessableDataException('Bad username')
    } else if (!this.userService.isValidPassword(userCreateInput.password)) {
      throw new UnprocessableDataException('Bad password')
    }

    const encryptedPassword = await encrypt(userCreateInput.password)

    const user: User = await this.prisma.user.create({
      data: {
        username: userCreateInput.username,
        password: encryptedPassword,
        email: userCreateInput.email
      }
    })
    const CreateUserProfileData: CreateUserProfileData = {
      userId: user.id,
      realName: 'John Doe'
    }
    await this.userService.createUserProfile(CreateUserProfileData)
    await this.userService.registerUserToPublicGroup(user.id)

    return user
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findAll()
  }

  async getUser(id: number): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        id: id
      }
    })
  }

  async updateUser(id: number, userUpdateInput: UserUpdateInput) {
    return await this.prisma.user.update({
      where: {
        id: id
      },
      update: {
        userUpdateInput
      }
    })
  }

  async deleteUser(id: number) {
    return await this.prisma.user.delete({
      where: {
        id: id
      }
    })
  }
}
