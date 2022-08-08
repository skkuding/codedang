import {
  Body,
  Controller,
  InternalServerErrorException,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { UserService } from './user.service'
import { UserEmailDto } from './dto/userEmail.dto'
import { NewPasswordDto } from './dto/newPassword.dto'
import {
  EmailTransmissionFailedException,
  InvalidPinException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { PasswordResetPinDto } from './dto/passwordResetPin.dto'
import { CookieOptions, Response } from 'express'
import { PASSWORD_RESET_COOKIE_OPTIONS } from './constants/jwt.constants'
import { AuthGuard } from '@nestjs/passport'
import { IGetRequestUserProp } from './interface/getRequestUserProp.interface'
import { Public } from '../common/decorator/public.decorator'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  setJwtInCookie(
    res: Response,
    jwt: string,
    cookieName: string,
    COOKIE_OPTIONS: CookieOptions
  ) {
    res.cookie(cookieName, jwt, COOKIE_OPTIONS)
  }

  @Post('/password/reset/send-email')
  @Public()
  createPinAndSendEmail(@Body() userEmailDto: UserEmailDto): Promise<string> {
    try {
      return this.userService.createPinAndSendEmail(userEmailDto)
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

  @Post('/password/reset/verify-pin')
  @Public()
  async verifyPinAndIssueJwt(
    @Res({ passthrough: true }) res,
    @Body() passwordResetPinDto: PasswordResetPinDto
  ): Promise<void> {
    try {
      const jwt = await this.userService.verifyPinAndIssueJwtForPasswordReset(
        passwordResetPinDto
      )

      this.setJwtInCookie(
        res,
        jwt,
        'token_for_password_reset',
        PASSWORD_RESET_COOKIE_OPTIONS
      )
      return
    } catch (error) {
      if (error instanceof InvalidUserException) {
        throw new UnauthorizedException(error.message)
      } else if (error instanceof InvalidPinException) {
        throw new InternalServerErrorException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Patch('/password/reset')
  @UseGuards(AuthGuard('passwordReset'))
  @Public()
  updatePassword(
    @Body() newPasswordDto: NewPasswordDto,
    @Req() req: IGetRequestUserProp
  ): Promise<string> {
    try {
      return this.userService.updatePassword(req, newPasswordDto)
    } catch (error) {
      throw new InternalServerErrorException('password reset failed')
    }
  }
}
