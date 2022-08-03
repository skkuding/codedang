import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { Cache } from 'cache-manager'
import { randomInt } from 'crypto'
import { PrismaService } from 'src/prisma/prisma.service'
import { encrypt } from 'src/common/hash'
import { passwordResetPinCacheKey } from 'src/common/cache/keys'
import { UserEmailDto } from './userEmail.dto'
import { NewPasswordDto } from './newPassword.dto'
import { User } from '@prisma/client'
import {
  InvalidPinException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { EmailService } from 'src/email/email.service'
import { PasswordResetPinDto } from './dto/passwordResetPin.dto'
import { JwtService } from '@nestjs/jwt'
import { IGetRequestUserProp } from './interface/getRequestUserProp.interface'

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService
  ) {}

  async getUserRole(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true
      },
      rejectOnNotFound: () => new UnauthorizedException()
    })
  }

  async getUserCredential(username: string) {
    return this.prisma.user.findUnique({
      where: { username }
    })
  }

  async updateLastLogin(username: string) {
    await this.prisma.user.update({
      where: { username },
      data: { last_login: new Date() }
    })
  }
  async getUserCredentialByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { email }
    })
  }

  async createPinAndSendEmail({ email }: UserEmailDto): Promise<string> {
    const user = await this.getUserCredentialByEmail(email)

    if (!user) {
      throw new InvalidUserException(
        `Cannot find a registered user whose email address is ${email}`
      )
    }

    const pin = this.createPinRandomly(6)

    await this.emailService.sendPasswordResetPin(email, pin)

    await this.createPinInCache(passwordResetPinCacheKey(user.email), pin, 300)

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
    req: IGetRequestUserProp,
    { newPassword }: NewPasswordDto
  ): Promise<string> {
    await this.updateUserPasswordInPrisma(req.user.id, newPassword)

    await this.deletePinFromCache(passwordResetPinCacheKey(req.user.email))

    return 'Password Reset successfully'
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

  async verifyPinAndIssueJwtTokenForPasswordReset({
    pin,
    email
  }: PasswordResetPinDto): Promise<string> {
    const storedResetPin: string = await this.getPinFromCache(
      passwordResetPinCacheKey(email)
    )

    if (!storedResetPin || pin !== storedResetPin) {
      throw new InvalidPinException('PIN not found or invalid PIN')
    }

    const user = await this.getUserCredentialByEmail(email)

    if (!user) {
      throw new InvalidUserException(
        `Cannot find a registered user whose email address is ${email}`
      )
    }

    const token = await this.createJwtToken({
      userId: user.id,
      email: user.email
    })

    return token
  }

  async createJwtToken(payload: object): Promise<string> {
    return await this.jwtService.signAsync(payload, { expiresIn: 300 })
  }
}
