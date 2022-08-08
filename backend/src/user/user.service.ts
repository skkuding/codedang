import {
  CACHE_MANAGER,
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
  InvalidPinException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { EmailService } from 'src/email/email.service'
import { PasswordResetPinDto } from './dto/passwordResetPin.dto'
import { JwtService } from '@nestjs/jwt'
import { IGetRequestUserProp } from './interface/getRequestUserProp.interface'
import {
  PASSWORD_RESET_PIN_EXPIRATION_SEC,
  PASSWORD_RESET_TOKEN_EXPIRATION_SEC
} from './constants/jwt.constants'

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
    req: IGetRequestUserProp,
    { newPassword }: NewPasswordDto
  ): Promise<string> {
    await this.updateUserPasswordInPrisma(req.user.id, newPassword)

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

  async verifyPinAndIssueJwtForPasswordReset({
    pin,
    email
  }: PasswordResetPinDto): Promise<string> {
    this.verifyPin(pin, email)

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
}
