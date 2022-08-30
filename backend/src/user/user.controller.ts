import {
  Body,
  Get,
  InternalServerErrorException,
  Patch,
  UnprocessableEntityException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  Controller
} from '@nestjs/common'
import { UserProfile, User } from '@prisma/client'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import {
  EntityNotExistException,
  InvalidUserException,
  UnprocessableDataException,
  EmailTransmissionFailedException,
  InvalidJwtTokenException,
  InvalidPinException
} from 'src/common/exception/business.exception'
import { GetUserProfileDto } from './dto/get-userprofile.dto'
import { SignUpDto } from './dto/signup.dto'
import { UpdateUserProfileRealNameDto } from './dto/update-userprofile-realname.dto'
import { WithdrawalDto } from './dto/withdrawal.dto'
import { UserService } from './user.service'
import { UserEmailDto } from './dto/userEmail.dto'
import { NewPasswordDto } from './dto/newPassword.dto'
import { EmailAuthensticationPinDto } from './dto/email-auth-pin.dto'
import { Request, Response } from 'express'
import { UpdateUserEmailDto } from './dto/update-user-email.dto'
import { AUTH_TYPE } from './constants/jwt.constants'
import { Public } from '../common/decorator/public.decorator'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('/password-reset')
  @Public()
  async updatePassword(
    @Body() newPasswordDto: NewPasswordDto,
    @Req() req: Request
  ): Promise<string> {
    try {
      return await this.userService.updatePassword(newPasswordDto, req)
    } catch (error) {
      if (error instanceof InvalidJwtTokenException) {
        throw new InternalServerErrorException(error.message)
      }
      throw new InternalServerErrorException('password reset failed')
    }
  }

  @Post('/sign-up')
  @Public()
  async signUp(@Req() req: Request, @Body() signUpDto: SignUpDto) {
    const emailAuthToken = req.cookies['email_auth_token']
    if (!emailAuthToken) throw new UnauthorizedException('Invalid Token')

    try {
      await this.userService.signUp(emailAuthToken, signUpDto)
      return
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }

  @Post('/withdrawal')
  async withdrawal(
    @Req() req: AuthenticatedRequest,
    @Body() withdrawalDto: WithdrawalDto
  ) {
    try {
      await this.userService.withdrawal(req.user.username, withdrawalDto)
      return
    } catch (error) {
      if (
        error instanceof InvalidUserException ||
        error instanceof EntityNotExistException
      ) {
        throw new UnauthorizedException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getUserProfile(
    @Req() req: AuthenticatedRequest
  ): Promise<GetUserProfileDto> {
    try {
      return await this.userService.getUserProfile(req.user.username)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Patch('/email')
  async updateUserEmail(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserEmail: UpdateUserEmailDto
  ): Promise<User> {
    try {
      return await this.userService.updateUserEmail(
        req.user.id,
        updateUserEmail
      )
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Patch('/realname')
  async updateUserProfileRealName(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserProfileRealNameDto: UpdateUserProfileRealNameDto
  ): Promise<UserProfile> {
    try {
      return await this.userService.updateUserProfileRealName(
        req.user.id,
        updateUserProfileRealNameDto
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Controller('email-auth')
@Public()
export class EmailAuthenticationController {
  constructor(private readonly userService: UserService) {}

  setJwtInHeader(res: Response, jwt: string) {
    res.setHeader('authorization', `${AUTH_TYPE} ${jwt}`)
  }

  @Post('/send-email/password-reset')
  async sendPinForPasswordReset(
    @Body() userEmailDto: UserEmailDto
  ): Promise<string> {
    try {
      return await this.userService.sendPinForPasswordReset(userEmailDto)
    } catch (error) {
      if (error instanceof InvalidUserException) {
        throw new UnauthorizedException(error.message)
      } else if (error instanceof EmailTransmissionFailedException) {
        throw new InternalServerErrorException(error.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  @Post('/send-email/sign-up')
  async sendPinForSignUp(@Body() userEmailDto: UserEmailDto): Promise<string> {
    try {
      return await this.userService.sendPinForSignUp(userEmailDto)
    } catch (error) {
      if (error instanceof EmailTransmissionFailedException) {
        throw new InternalServerErrorException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Post('/verify-pin')
  async verifyPinAndIssueJwt(
    @Res({ passthrough: true }) res,
    @Body() emailAuthenticationpinDto: EmailAuthensticationPinDto
  ): Promise<void> {
    try {
      const jwt = await this.userService.verifyPinAndIssueJwt(
        emailAuthenticationpinDto
      )
      this.setJwtInHeader(res, jwt)
      return
    } catch (error) {
      if (error instanceof InvalidPinException) {
        throw new InternalServerErrorException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
