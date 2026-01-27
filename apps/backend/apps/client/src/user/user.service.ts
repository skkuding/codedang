import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, type JwtVerifyOptions } from '@nestjs/jwt'
import type { User, UserProfile } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { hash } from 'argon2'
import { Cache } from 'cache-manager'
import { randomInt } from 'crypto'
import type { Request } from 'express'
import { generate } from 'generate-password'
import { ExtractJwt } from 'passport-jwt'
import { type AuthenticatedRequest, JwtAuthService } from '@libs/auth'
import { emailAuthenticationPinCacheKey } from '@libs/cache'
import { EMAIL_AUTH_EXPIRE_TIME, ARGON2_HASH_OPTION } from '@libs/constants'
import {
  ConflictFoundException,
  DuplicateFoundException,
  EntityNotExistException,
  InvalidJwtTokenException,
  UnidentifiedException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { EmailService } from '@client/email/email.service'
import { GroupService } from '@client/group/group.service'
import type { EmailAuthenticationPinDto } from './dto/email-auth-pin.dto'
import type { NewPasswordDto } from './dto/newPassword.dto'
import type { SignUpDto } from './dto/signup.dto'
import type { SocialSignUpDto } from './dto/social-signup.dto'
import type { UpdateUserEmailDto } from './dto/update-user-email.dto'
import type { UpdateUserDto } from './dto/updateUser.dto'
import type { UserEmailDto } from './dto/userEmail.dto'
import type { UsernameDto } from './dto/username.dto'
import type { CreateUserProfileData } from './interface/create-userprofile.interface'
import type {
  EmailAuthJwtPayload,
  EmailAuthJwtObject
} from './interface/jwt.interface'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly groupService: GroupService,
    private readonly jwtAuthService: JwtAuthService
  ) {}

  /**
   * 이메일 주소에 해당하는 사용자 이름을 조회합니다.
   *
   * @param {string} email
   * @returns 조회한 사용자 이름
   */
  async getUsernameByEmail({ email }: UserEmailDto) {
    const username = await this.prisma.user.findUniqueOrThrow({
      where: {
        email
      },
      select: {
        username: true,
        id: true,
        userProfile: {
          select: {
            realName: true
          }
        }
      }
    })

    this.logger.debug(username, 'getUsernameByEmail')
    return username
  }

  /**
   * 사용자의 마지막 로그인 시간을 현재 시점으로 업데이트 합니다.
   *
   * @param {string} username 사용자 이름
   */
  async updateLastLogin(username: string) {
    const user = await this.prisma.user.update({
      where: { username },
      data: { lastLogin: new Date() }
    })
    this.logger.debug(user, 'updateLastLogin')
  }

  /**
   *
   * @param {string} email 이메일 주소
   * @return
   */
  async sendPinForRegisterNewEmail({ email }: UserEmailDto): Promise<string> {
    const duplicatedUser = await this.getUserCredentialByEmail(email)
    if (duplicatedUser) {
      this.logger.debug('email duplicated')
      throw new DuplicateFoundException('Email')
    }

    if (!email.endsWith('@skku.edu')) {
      this.logger.debug('invalid email domain', { email })
      throw new UnprocessableDataException('Only @skku.edu emails are allowed')
    }

    return this.createPinAndSendEmail(email)
  }

  /**
   * 비밀번호 재설정을 위한 pin번호를 사용자 이메일로 전송합니다.
   *
   * @param {string} email 사용자 이메일 주소
   * @throws {UnidentifiedException} DB에 이메일 주소와 일치하는 사용자가 없으면 예외를 발생시킵니다.
   * @returns {Promise<string>} pin 번호 전송 성공 메시지
   */
  async sendPinForPasswordReset({ email }: UserEmailDto): Promise<string> {
    const user = await this.getUserCredentialByEmail(email)
    if (!user) {
      this.logger.debug('no registered email')
      throw new UnidentifiedException(`Email ${email}`)
    }

    return this.createPinAndSendEmail(user.email)
  }

  /**
   * 이메일 주소에 해당하는 사용자를 반환합니다.
   *
   * @param {string} email 이메일 주소
   * @returns 조회된 사용자
   */
  async getUserCredentialByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })
    this.logger.debug(user, 'getUserCredentialByEmail')
    return user
  }

  /**
   * pin 번호를 생성해 이메일로 전송하고, 인증을 위해 캐시에 저장합니다.
   *
   * @param {string} email pin 번호를 받을 사용자 이메일 주소
   * @returns {Promise<string>} pin 번호 전송 성공 메시지
   */
  async createPinAndSendEmail(email: string): Promise<string> {
    const pin = this.createPinRandomly(6)

    await this.emailService.sendEmailAuthenticationPin(email, pin)

    await this.setPinInCache(
      emailAuthenticationPinCacheKey(email),
      pin,
      1000 * EMAIL_AUTH_EXPIRE_TIME
    )

    return 'Email authentication pin is sent to your email address'
  }

  /**
   * 랜덤으로 pin 번호를 생성합니다.
   *
   * @param {number} numberOfDigits 생성하려는 pin 번호의 자릿수
   * @returns 입력한 자릿수의 랜덤 pin 번호를 반환합니다.
   */

  createPinRandomly(numberOfDigits: number): string {
    const pin = randomInt(0, Number('1'.padEnd(numberOfDigits + 1, '0')))
      .toString()
      .padStart(numberOfDigits, '0')
    this.logger.debug({ pin }, 'createPinRandomly')
    return pin
  }

  /**
   * 사용자 비밀번호를 업데이트합니다.
   *
   * @param {string} newPassword 변경하려는 새로운 비밀번호
   * @param {Request} req
   * @throws {UnprocessableDataException}
   * @returns {Promise<string>} 비밀번호 변경이 성공했다는 메시지를 반환합니다.
   */
  async updatePassword(
    { newPassword }: NewPasswordDto,
    req: Request
  ): Promise<string> {
    if (!this.isValidPassword(newPassword)) {
      throw new UnprocessableDataException('Bad password')
    }

    const { email } = await this.verifyJwtFromRequestHeader(req)
    await this.deletePinFromCache(emailAuthenticationPinCacheKey(email))
    await this.updateUserPasswordInPrisma(email, newPassword)

    return 'Password Reset successfully'
  }

  async verifyJwtFromRequestHeader(
    req: Request,
    jwtVerifyOptions: JwtVerifyOptions = {}
  ): Promise<EmailAuthJwtObject> {
    const token = ExtractJwt.fromHeader('email-auth')(req) ?? ''
    const options = {
      secret: this.config.get('JWT_SECRET'),
      ...jwtVerifyOptions
    }
    try {
      const decodedJwtObject = await this.jwtService.verifyAsync(token, options)
      this.logger.debug(
        {
          token,
          verifyOption: options,
          decodedJwtObject
        },
        'verifyJwtFromRequestHeader - pass'
      )
      return decodedJwtObject
    } catch (error) {
      this.logger.debug(
        {
          token,
          verifyOption: options
        },
        'verifyJwtFromRequestHeader - fail'
      )
      throw new InvalidJwtTokenException(error.message)
    }
  }

  /**
   * DB상에서 변경된 사용자 비밀번호를 암호화하여 업데이트합니다.
   *
   * @param {string} email 사용자 이메일 주소
   * @param {string} newPassword 새로운 비밀번호
   * @returns {Promise<User>} 비밀번호가 업데이트 된 user 객체
   */
  async updateUserPasswordInPrisma(
    email: string,
    newPassword: string
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: {
        email
      },
      data: {
        password: await hash(newPassword, ARGON2_HASH_OPTION) //암호화
      }
    })
    this.logger.debug(user, 'updateUserPasswordInPrisma')

    return user
  }

  async verifyPinAndIssueJwt({
    pin,
    email
  }: EmailAuthenticationPinDto): Promise<string> {
    await this.verifyPin(pin, email)

    const payload: EmailAuthJwtPayload = { email }
    const token = await this.createJwt(payload)

    return token
  }

  async verifyPin(pin: string, email: string): Promise<boolean> | never {
    const storedResetPin = await this.getPinFromCache(
      emailAuthenticationPinCacheKey(email)
    )

    if (!storedResetPin || pin !== storedResetPin) {
      this.logger.debug(
        {
          inputPin: pin,
          storedPin: storedResetPin
        },
        'verifyPin - input is different from stored one'
      )
      throw new UnidentifiedException(`Pin ${pin}`)
    }
    return true
  }

  async getPinFromCache(key: string) {
    const storedPin = await this.cacheManager.get<string>(key)
    this.logger.debug({ key, value: storedPin }, 'getPinFromCache')
    return storedPin
  }

  async deletePinFromCache(key: string) {
    await this.cacheManager.del(key)
    this.logger.debug({ key }, 'deletePinFromCache')
  }

  /**
   * 사용자 식별을 위해 key값(이메일 주소)과 pin번호를 value값으로 하여 유효 시간(TTL) 동안 서버에 캐시(cache)합니다.
   *
   * @param {string} key 사용자 식별을 위한 key값 (이메일 주소)
   * @param {string} value 캐시하는 value값 (pin 번호)
   * @param {number} ttl 인증이 유효한 시간 (TTL)
   */
  async setPinInCache(key: string, value: string, ttl: number) {
    await this.cacheManager.set(key, value, ttl)
    this.logger.debug({ key, value, ttl }, 'setPinInCache')
  }

  async createJwt(payload: EmailAuthJwtPayload) {
    const jwt = await this.jwtService.signAsync(payload, {
      expiresIn: EMAIL_AUTH_EXPIRE_TIME
    })
    this.logger.debug({ jwt }, 'createJwt')
    return jwt
  }

  async signUp(req: Request, signUpDto: SignUpDto) {
    const { email } = await this.verifyJwtFromRequestHeader(req)
    if (email != signUpDto.email) {
      this.logger.debug(
        {
          verifiedEmail: email,
          requestedEmail: signUpDto.email
        },
        'signUp - fail (unauthenticated email)'
      )
      throw new UnprocessableDataException('The email is not authenticated one')
    }

    const duplicatedUser = await this.prisma.user.findUnique({
      where: {
        username: signUpDto.username
      }
    })
    if (duplicatedUser) {
      this.logger.debug('username duplicated')
      throw new DuplicateFoundException('Username')
    }

    if (!this.isValidUsername(signUpDto.username)) {
      this.logger.debug('signUp - fail (invalid username)')
      throw new UnprocessableDataException('Bad username')
    } else if (!this.isValidPassword(signUpDto.password)) {
      this.logger.debug('signUp - fail (invalid password)')
      throw new UnprocessableDataException('Bad password')
    }

    await this.deletePinFromCache(emailAuthenticationPinCacheKey(email))

    const user: User = await this.createUser(signUpDto)
    const CreateUserProfileData: CreateUserProfileData = {
      userId: user.id,
      realName: signUpDto.realName
    }
    await this.createUserProfile(CreateUserProfileData)

    return user
  }

  async socialSignUp(socialSignUpDto: SocialSignUpDto): Promise<User> {
    const duplicatedUser = await this.prisma.user.findUnique({
      where: {
        username: socialSignUpDto.username
      }
    })
    if (duplicatedUser) {
      this.logger.debug('socialSignUp - fail (username duplicated)')
      throw new DuplicateFoundException('Username')
    }

    if (!this.isValidUsername(socialSignUpDto.username)) {
      this.logger.debug('socialSignUp - fail (invalid username)')
      throw new UnprocessableDataException('Bad username')
    }

    const user = await this.createUser({
      username: socialSignUpDto.username,
      password: generate({ length: 10, numbers: true }),
      realName: socialSignUpDto.realName,
      email: socialSignUpDto.email,
      studentId: socialSignUpDto.studentId,
      college: socialSignUpDto.college,
      major: socialSignUpDto.major
    })
    const profile: CreateUserProfileData = {
      userId: user.id,
      realName: socialSignUpDto.realName
    }

    await this.createUserProfile(profile)
    await this.createUserOAuth(socialSignUpDto, user.id)

    return user
  }

  isValidUsername(username: string): boolean {
    const validUsername = /^[a-z0-9]{3,10}$/
    if (!validUsername.test(username)) {
      return false
    }
    return true
  }

  /**
   * 입력된 비밀번호가 설정한 형식에 부합하는 올바른 비밀번호인지 검증합니다.
   *
   * @param {string} password 비밀번호
   * @returns {boolean} 비밀번호가 올바른지 아닌지 반환합니다.
   */
  isValidPassword(password: string): boolean {
    const invalidPassword = /^(.{0,7}|[a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
    if (invalidPassword.test(password)) {
      return false
    }
    return true
  }

  /**
   * DB상에 새로 회원가입한 사용자(및 정보)를 추가합니다.
   *
   * @param signUpDto 회원가입 정보 DTO 객체
   * @returns {Promise<User>} 새로 추가된 user 객체
   */
  async createUser(signUpDto: SignUpDto): Promise<User> {
    const encryptedPassword = await hash(signUpDto.password, ARGON2_HASH_OPTION) //암호화

    const user = await this.prisma.user.create({
      data: {
        username: signUpDto.username,
        password: encryptedPassword,
        email: signUpDto.email,
        studentId: signUpDto.studentId,
        college: signUpDto.college,
        major: signUpDto.major
      }
    })
    this.logger.debug(user, 'createUser')
    return user
  }

  /**
   * 사용자의 소셜 서비스(OAuth) 연동 정보를 DB에 생성합니다.
   *
   * @param socialSignUpDto 소셜 플랫폼에서 제공받은 계정 정보
   * @param {number} userId 사용자 Id
   * @returns 생성된 소셜 연동 정보 userOAuth 객체
   */
  async createUserOAuth(socialSignUpDto: SocialSignUpDto, userId: number) {
    const userOAuth = await this.prisma.userOAuth.create({
      data: {
        id: socialSignUpDto.id,
        userId,
        provider: socialSignUpDto.provider
      }
    })
    this.logger.debug(userOAuth, 'createUserOAuth')
    return userOAuth
  }

  /**
   * DB에 새로운 user 프로필을 생성합니다.
   *
   * @param createUserProfileData user 프로필 정보
   * @returns {Promise<UserProfile>} 생성된 user 프로필 객체를 반환합니다.
   */
  async createUserProfile(
    createUserProfileData: CreateUserProfileData
  ): Promise<UserProfile> {
    const userProfile = await this.prisma.userProfile.create({
      data: {
        realName: createUserProfileData.realName,
        user: {
          connect: { id: createUserProfileData.userId }
        }
      }
    })
    this.logger.debug(userProfile, 'createUserProfile')
    return userProfile
  }

  async deleteUser(username: string, password: string) {
    const user = await this.getUserCredential(username)
    if (!(user && (await this.jwtAuthService.isValidUser(user, password)))) {
      this.logger.debug('user not exist or login fail')
      throw new UnidentifiedException('Password')
    }

    const leadingGroups = await this.prisma.userGroup.findMany({
      where: {
        userId: user.id,
        isGroupLeader: true
      },
      select: {
        groupId: true
      }
    })
    this.logger.debug(
      { leadingGroups, userId: user.id },
      'UserGroups where this user is the group leader'
    )

    if (leadingGroups.length) {
      const ledByOne = (
        await this.prisma.userGroup.groupBy({
          by: ['groupId'],
          where: {
            groupId: {
              in: leadingGroups.map((group) => group.groupId)
            },
            isGroupLeader: true
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _count: {
            userId: true
          }
        })
      ).filter((group) => group._count.userId === 1)
      this.logger.debug(ledByOne, 'Groups where the only leader is you')

      if (ledByOne.length) {
        const groupNames = (
          await this.prisma.group.findMany({
            where: {
              id: {
                in: ledByOne.map((group) => group.groupId)
              }
            },
            select: {
              groupName: true
            }
          })
        )
          .map((group) => group.groupName)
          .join(', ')
        throw new ConflictFoundException(
          `Cannot delete this account since you are the only leader of group ${groupNames}`
        )
      }
    }
    const deletedUser = await this.prisma.user.delete({
      where: {
        username
      }
    })
    this.logger.debug(deletedUser, 'deleted user')
  }

  async getUserCredential(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username }
    })
    if (!user) {
      throw new EntityNotExistException('User')
    }
    this.logger.debug(user, 'getUserCredential')
    return user
  }

  async getUserProfile(username: string) {
    const userWithProfile = await this.prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        role: true,
        email: true,
        lastLogin: true,
        updateTime: true,
        studentId: true,
        college: true,
        major: true,
        userProfile: {
          select: {
            realName: true
          }
        },
        canCreateContest: true,
        canCreateCourse: true
      }
    })
    if (!userWithProfile) {
      throw new EntityNotExistException('User')
    }
    this.logger.debug(userWithProfile, 'getUserProfile')
    return userWithProfile
  }

  async updateUserEmail(
    req: AuthenticatedRequest,
    updateUserEmailDto: UpdateUserEmailDto
  ): Promise<User> {
    const { email } = await this.verifyJwtFromRequestHeader(req)
    if (email != updateUserEmailDto.email) {
      this.logger.debug(
        {
          verifiedEmail: email,
          requestedEmail: updateUserEmailDto.email
        },
        'updateUserEmail - fail (different from the verified email)'
      )
      throw new UnprocessableDataException('The email is not authenticated one')
    }

    await this.deletePinFromCache(emailAuthenticationPinCacheKey(email))

    try {
      const user = await this.prisma.user.update({
        where: { id: req.user.id },
        data: {
          email: updateUserEmailDto.email
        }
      })
      this.logger.debug(user, 'updateUserEmail')
      return user
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      )
        throw new EntityNotExistException('User')
      throw error
    }
  }

  /**
   * 이미 존재하는 사용자 이름인지 확인합니다,
   *
   * @param {string} usernameDto 사용자 이름
   * @throws {DuplicateFoundException} 이미 중복되는 사용자 이름이 있으면 예외를 발생시킵니다.
   */
  async checkDuplicatedUsername(usernameDto: UsernameDto) {
    const duplicatedUser = await this.prisma.user.findUnique({
      where: {
        username: usernameDto.username
      }
    })

    if (duplicatedUser) {
      this.logger.debug('exception (username duplicated)')
      throw new DuplicateFoundException('User')
    }
  }

  // update user field (password, studentId, college, major, realName)
  async updateUser(req: AuthenticatedRequest, updateUserDto: UpdateUserDto) {
    let encryptedNewPassword: string | undefined = undefined

    if (updateUserDto.newPassword) {
      if (!updateUserDto.password) {
        throw new UnprocessableDataException(
          'Current password needed to change password'
        )
      }
      const user = await this.getUserCredential(req.user.username)
      if (!user) {
        throw new EntityNotExistException('User')
      }

      const isValidUser = await this.jwtAuthService.isValidUser(
        user,
        updateUserDto.password
      )
      if (!isValidUser) {
        throw new UnidentifiedException('Current password')
      }

      if (!this.isValidPassword(updateUserDto.newPassword)) {
        throw new UnprocessableDataException('Bad new password')
      }

      encryptedNewPassword = await hash(
        updateUserDto.newPassword,
        ARGON2_HASH_OPTION
      )
    }

    const updateData = {
      password: encryptedNewPassword,
      studentId: updateUserDto.studentId,
      college: updateUserDto.college,
      major: updateUserDto.major,
      userProfile: {
        update: { realName: updateUserDto.realName }
      }
    }

    return await this.prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        // don't select password for security
        studentId: true,
        college: true,
        major: true,
        userProfile: {
          select: {
            realName: true
          }
        }
      }
    })
  }
}
