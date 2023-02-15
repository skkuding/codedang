import { CACHE_MANAGER, forwardRef, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { randomInt } from 'crypto'
import { PrismaService } from 'src/prisma/prisma.service'
import { encrypt } from 'src/common/hash'
import { emailAuthenticationPinCacheKey } from 'src/common/cache/keys'
import { UserEmailDto } from './dto/userEmail.dto'
import { NewPasswordDto } from './dto/newPassword.dto'
import { User, UserProfile } from '@prisma/client'
import {
  EntityNotExistException,
  InvalidJwtTokenException,
  InvalidPinException,
  InvalidUserException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { EmailService } from 'src/email/email.service'
import { EmailAuthensticationPinDto } from './dto/email-auth-pin.dto'
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt'
import { EMAIL_AUTH_EXPIRE_TIME } from '../common/constants'
import { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import {
  EmailAuthJwtPayload,
  EmailAuthJwtObject
} from './interface/jwt.interface'
import { CreateUserProfileData } from './interface/create-userprofile.interface'
import { GroupService } from 'src/group/group.service'
import { UserGroupData } from 'src/group/interface/user-group-data.interface'
import { WithdrawalDto } from './dto/withdrawal.dto'
import { AuthService } from 'src/auth/auth.service'
import { GetUserProfileDto } from './dto/get-userprofile.dto'
import { UpdateUserProfileRealNameDto } from './dto/update-userprofile-realname.dto'
import { UpdateUserEmailDto } from './dto/update-user-email.dto'
import { SignUpDto } from './dto/signup.dto'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'

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
      rejectOnNotFound: () => new EntityNotExistException('notice')
    })
  }

  async updateLastLogin(username: string) {
    await this.prisma.user.update({
      where: { username },
      data: { lastLogin: new Date() }
    })
  }

  async sendPinForRegisterNewEmail({ email }: UserEmailDto): Promise<string> {
    const duplicatedUser = await this.getUserCredentialByEmail(email)
    if (duplicatedUser) {
      throw new UnprocessableDataException('This email is already used')
    }

    return this.createPinAndSendEmail(email)
  }

  async sendPinForPasswordReset({ email }: UserEmailDto): Promise<string> {
    const user = await this.getUserCredentialByEmail(email)
    if (!user) {
      throw new InvalidUserException(
        `Cannot find a registered user whose email address is ${email}`
      )
    }

    return this.createPinAndSendEmail(user.email)
  }

  async getUserCredentialByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { email }
    })
  }

  async createPinAndSendEmail(email: string): Promise<string> {
    const pin = this.createPinRandomly(6)

    await this.emailService.sendEmailAuthenticationPin(email, pin)

    await this.cacheManager.set(
      emailAuthenticationPinCacheKey(email),
      pin,
      1000 * EMAIL_AUTH_EXPIRE_TIME
    )

    return 'Email authentication pin is sent to your email address'
  }

  createPinRandomly(numberOfDigits: number): string {
    return randomInt(0, Number('1'.padEnd(numberOfDigits + 1, '0')))
      .toString()
      .padStart(numberOfDigits, '0')
  }

  async updatePassword(
    { newPassword }: NewPasswordDto,
    req: Request
  ): Promise<string> {
    if (!this.isValidPassword(newPassword)) {
      throw new UnprocessableDataException('Bad password')
    }

    const { email } = await this.verifyJwtFromRequestHeader(req)
    await this.updateUserPasswordInPrisma(email, newPassword)

    return 'Password Reset successfully'
  }

  async verifyJwtFromRequestHeader(
    req: Request,
    jwtVerifyOptions: JwtVerifyOptions = {}
  ): Promise<EmailAuthJwtObject> {
    const token = ExtractJwt.fromHeader('email-auth')(req)
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

  async updateUserPasswordInPrisma(
    email: string,
    newPassword: string
  ): Promise<User> {
    return await this.prisma.user.update({
      where: {
        email
      },
      data: {
        password: await encrypt(newPassword)
      }
    })
  }

  async verifyPinAndIssueJwt({
    pin,
    email
  }: EmailAuthensticationPinDto): Promise<string> {
    await this.verifyPin(pin, email)
    await this.deletePinFromCache(emailAuthenticationPinCacheKey(email))

    const payload: EmailAuthJwtPayload = { email }
    const token = await this.createJwt(payload)

    return token
  }

  async verifyPin(pin: string, email: string): Promise<boolean> | never {
    const storedResetPin: string = await this.getPinFromCache(
      emailAuthenticationPinCacheKey(email)
    )

    if (!storedResetPin || pin !== storedResetPin) {
      throw new InvalidPinException()
    }
    return true
  }

  async getPinFromCache(key: string): Promise<string> {
    const storedPin: string = await this.cacheManager.get(key)
    return storedPin
  }

  async deletePinFromCache(key: string): Promise<void> {
    await this.cacheManager.del(key)
  }

  async createJwt(payload: EmailAuthJwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      expiresIn: EMAIL_AUTH_EXPIRE_TIME
    })
  }

  async signUp(req: Request, signUpDto: SignUpDto): Promise<User> {
    const { email } = await this.verifyJwtFromRequestHeader(req)
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

    if (!this.isValidUsername(signUpDto.username)) {
      throw new UnprocessableDataException('Bad username')
    } else if (!this.isValidPassword(signUpDto.password)) {
      throw new UnprocessableDataException('Bad password')
    }

    const user: User = await this.createUser(signUpDto)
    const CreateUserProfileData: CreateUserProfileData = {
      userId: user.id,
      realName: signUpDto.realName
    }
    await this.createUserProfile(CreateUserProfileData)
    await this.registerUserToPublicGroup(user.id)

    return user
  }

  isValidUsername(username: string): boolean {
    const validUsername = /^[a-z0-9]{3,10}$/
    if (!validUsername.test(username)) {
      return false
    }
    return true
  }

  isValidPassword(password: string): boolean {
    const invalidPassword = /^(.{0,7}|[a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
    if (invalidPassword.test(password)) {
      return false
    }
    return true
  }

  async createUser(signUpDto: SignUpDto): Promise<User> {
    const encryptedPassword = await encrypt(signUpDto.password)

    return await this.prisma.user.create({
      data: {
        username: signUpDto.username,
        password: encryptedPassword,
        email: signUpDto.email,
        lastLogin: null
      }
    })
  }

  async createUserProfile(
    createUserProfileData: CreateUserProfileData
  ): Promise<UserProfile> {
    return await this.prisma.userProfile.create({
      data: {
        realName: createUserProfileData.realName,
        user: {
          connect: { id: createUserProfileData.userId }
        }
      }
    })
  }

  async registerUserToPublicGroup(userId: number) {
    const userGroupData: UserGroupData = {
      userId,
      groupId: 1,
      isRegistered: true,
      isGroupLeader: false
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
    await this.prisma.user.findUnique({
      where: {
        username
      },
      rejectOnNotFound: () => new EntityNotExistException('user')
    })

    await this.prisma.user.delete({
      where: {
        username
      }
    })
  }

  async getUserProfile(username: string): Promise<GetUserProfileDto> {
    return await this.prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        role: true,
        email: true,
        lastLogin: true,
        updateTime: true,
        userProfile: {
          select: {
            realName: true
          }
        }
      },
      rejectOnNotFound: () => new EntityNotExistException('user')
    })
  }

  async updateUserEmail(
    req: AuthenticatedRequest,
    updateUserEmailDto: UpdateUserEmailDto
  ): Promise<User> {
    const { email } = await this.verifyJwtFromRequestHeader(req)
    if (email != updateUserEmailDto.email) {
      throw new UnprocessableDataException('The email is not authenticated one')
    }

    await this.prisma.user.findUnique({
      where: { id: req.user.id },
      rejectOnNotFound: () => new EntityNotExistException('user')
    })

    return await this.prisma.user.update({
      where: { id: req.user.id },
      data: {
        email: updateUserEmailDto.email
      }
    })
  }

  async updateUserProfileRealName(
    userId: number,
    updateUserProfileRealNameDto: UpdateUserProfileRealNameDto
  ): Promise<UserProfile> {
    await this.prisma.userProfile.findUnique({
      where: { userId },
      rejectOnNotFound: () => new EntityNotExistException('user profile')
    })

    return await this.prisma.userProfile.update({
      where: { userId },
      data: {
        realName: updateUserProfileRealNameDto.realName
      }
    })
  }
}
