import {
  CACHE_MANAGER,
  Inject,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Cache } from 'cache-manager'
import { randomInt } from 'crypto'
import { PrismaService } from 'src/prisma/prisma.service'
import { encrypt } from 'src/common/hash'
import { passwordResetPinCacheKey } from 'src/common/cache/keys'
import { UserEmailDto } from './dto/userEmail.dto'
import { NewPasswordDto } from './dto/newPassword.dto'
import { User } from '@prisma/client'
import {
  InvalidJwtTokenException,
  InvalidPinException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { EmailService } from 'src/email/email.service'
import { PasswordResetPinDto } from './dto/passwordResetPin.dto'
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt'
import {
  PASSWORD_RESET_PIN_EXPIRATION_SEC,
  PASSWORD_RESET_TOKEN_EXPIRATION_SEC
} from './constants/jwt.constants'
import { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PasswordResetJwtObject } from './interface/jwt.interface'
import { SignUpDto } from './dto/sign-up.dto'
import {
  EntityNotExistException,
  InvalidUserException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { User, UserProfile } from '@prisma/client'
import { encrypt } from 'src/common/hash'
import { CreateUserProfileData } from './interface/create-userprofile.interface'
import { GroupService } from 'src/group/group.service'
import { UserGroupData } from 'src/group/interface/user-group-data.interface'
import { WithdrawalDto } from './dto/withdrawal.dto'
import { AuthService } from 'src/auth/auth.service'
import { GetUserProfileDto } from './dto/get-userprofile.dto'
import { UpdateUserRealNameDto } from './dto/update-user-realname.dto'

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly groupService: GroupService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  async getUserRole(userId: number): Promise<Partial<User>> {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true
      },
      rejectOnNotFound: () => new UnauthorizedException()
    })
  }

  async updateLastLogin(username: string) {
    await this.prisma.user.update({
      where: { username },
      data: { lastLogin: new Date() }
    })
  }
  async getUserCredentialByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { email },
      rejectOnNotFound: () =>
        new InvalidUserException(
          `Cannot find a registered user whose email address is ${email}`
        )
    })
  }

  async createPinAndSendEmail({ email }: UserEmailDto): Promise<string> {
    const user = await this.getUserCredentialByEmail(email)

    const pin = this.createPinRandomly(6)

    await this.emailService.sendPasswordResetPin(email, pin)

    await this.createPinInCache(
      passwordResetPinCacheKey(user.email),
      pin,
      PASSWORD_RESET_PIN_EXPIRATION_SEC
    )

    return 'Password reset link was sent to your email'
  }

  createPinRandomly(numberOfDigits: number): string {
    return randomInt(0, Number('1'.padEnd(numberOfDigits + 1, '0')))
      .toString()
      .padStart(numberOfDigits, '0')
  }

  async createPinInCache(
    key: string,
    pin: string,
    timeToLive: number
  ): Promise<void> {
    await this.cacheManager.set(key, pin, { ttl: timeToLive })
  }

  async updatePassword(
    { newPassword }: NewPasswordDto,
    req: Request
  ): Promise<string> {
    const { userId } = await this.verifyJwtFromRequestHeader(req)
    await this.updateUserPasswordInPrisma(userId, newPassword)

    return 'Password Reset successfully'
  }

  async verifyJwtFromRequestHeader(
    req: Request,
    jwtVerifyOptions: JwtVerifyOptions = {}
  ): Promise<PasswordResetJwtObject> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req)
    const options = {
      secret: this.config.get('JWT_SECRET'),
      ...jwtVerifyOptions
    }
    try {
      return await this.jwtService.verifyAsync(token, options)
    } catch (error) {
      throw new InvalidJwtTokenException(error.message)
    }
  }

  async getPinFromCache(key: string): Promise<string> {
    const storedPin: string = await this.cacheManager.get(key)
    return storedPin
  }

  async deletePinFromCache(key: string): Promise<void> {
    await this.cacheManager.del(key)
  }

  async updateUserPasswordInPrisma(
    userId: number,
    newPassword: string
  ): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        password: await encrypt(newPassword)
      }
    })

    return updatedUser
  }

  async verifyPinAndIssueJwtForPasswordReset({
    pin,
    email
  }: PasswordResetPinDto): Promise<string> {
    await this.verifyPin(pin, email)

    const user = await this.getUserCredentialByEmail(email)

    await this.deletePinFromCache(passwordResetPinCacheKey(email))

    const token = await this.createJwt(
      {
        userId: user.id
      },
      PASSWORD_RESET_TOKEN_EXPIRATION_SEC
    )

    return token
  }

  async verifyPin(pin: string, email: string): Promise<boolean> | never {
    const storedResetPin: string = await this.getPinFromCache(
      passwordResetPinCacheKey(email)
    )

    if (!storedResetPin || pin !== storedResetPin) {
      throw new InvalidPinException()
    }

    return true
  }

  async createJwt(payload: object, ttl: number): Promise<string> {
    return await this.jwtService.signAsync(payload, { expiresIn: ttl })
  }

  async signUp(emailAuthToken: string, signUpDto: SignUpDto): Promise<User> {
    //const { email } = await this.authService.verifyJwtToken(emailAuthToken)
    const email = 'authenticated email by jwt'
    if (email != signUpDto.email) {
      throw new UnprocessableDataException('The email is not authenticated one')
    }

    const duplicatedUser: User = await this.prisma.user.findUnique({
      where: {
        username: signUpDto.username
      }
    })
    if (duplicatedUser) {
      throw new UnprocessableDataException('Username already exists')
    }

    const user: User = await this.createUser(signUpDto)
    const CreateUserProfileData: CreateUserProfileData = {
      user_id: user.id,
      real_name: signUpDto.real_name
    }
    await this.createUserProfile(CreateUserProfileData)
    await this.registerUserToPublicGroup(user.id)

    return user
  }

  async createUser(signUpDto: SignUpDto): Promise<User> {
    const encryptedPassword = await encrypt(signUpDto.password)

    return await this.prisma.user.create({
      data: {
        username: signUpDto.username,
        password: encryptedPassword,
        email: signUpDto.email,
        last_login: null
      }
    })
  }

  async createUserProfile(
    CreateUserProfileData: CreateUserProfileData
  ): Promise<UserProfile> {
    return await this.prisma.userProfile.create({
      data: {
        real_name: CreateUserProfileData.real_name,
        user: {
          connect: { id: CreateUserProfileData.user_id }
        }
      }
    })
  }

  async registerUserToPublicGroup(userId: number) {
    const userGroupData: UserGroupData = {
      user_id: userId,
      group_id: 1,
      is_registerd: true,
      is_group_manager: false
    }
    await this.groupService.createUserGroup(userGroupData)
  }

  async withdrawal(username: string, withdrawalDto: WithdrawalDto) {
    const user: User = await this.getUserCredential(username)

    if (!(await this.authService.isValidUser(user, withdrawalDto.password))) {
      throw new InvalidUserException('Incorrect password')
    }

    this.deleteUser(username)
  }

  async getUserCredential(username: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { username }
    })
  }

  async deleteUser(username: string) {
    const user: User = await this.prisma.user.findUnique({
      where: {
        username
      }
    })

    if (!user) {
      throw new EntityNotExistException('User')
    }

    await this.prisma.user.delete({
      where: {
        username
      }
    })
  }

  async getUserProfile(username: string): Promise<GetUserProfileDto> {
    const userProfile = await this.prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        role: true,
        email: true,
        last_login: true,
        update_time: true,
        UserProfile: {
          select: {
            real_name: true
          }
        }
      }
    })

    if (!userProfile) {
      throw new EntityNotExistException('User')
    }

    return userProfile
  }

  //TODO: implement update email

  async updateUserRealName(
    userId: number,
    updateUserRealNameDto: UpdateUserRealNameDto
  ): Promise<UserProfile> {
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { user_id: userId }
    })

    if (!userProfile) {
      throw new EntityNotExistException('UserProfile')
    }

    return await this.prisma.userProfile.update({
      where: { user_id: userId },
      data: {
        real_name: updateUserRealNameDto.real_name
      }
    })
  }
}
