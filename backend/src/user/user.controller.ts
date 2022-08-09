import {
  Body,
  Controller,
  InternalServerErrorException,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException
} from '@nestjs/common'
import { UserService } from './user.service'
import { UserEmailDto } from './dto/userEmail.dto'
import { NewPasswordDto } from './dto/newPassword.dto'
import {
  EmailTransmissionFailedException,
  InvalidJwtTokenException,
  InvalidPinException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { PasswordResetPinDto } from './dto/passwordResetPin.dto'
import { Request, Response } from 'express'
import { AUTH_TYPE } from './constants/jwt.constants'
import { Public } from '../common/decorator/public.decorator'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  setJwtInHeader(res: Response, jwt: string) {
    res.setHeader('authorization', `${AUTH_TYPE} ${jwt}`)
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

      this.setJwtInHeader(res, jwt)
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
  @Public()
  updatePassword(
    @Body() newPasswordDto: NewPasswordDto,
    @Req() req: Request
  ): Promise<string> {
    try {
      return this.userService.updatePassword(newPasswordDto, req)
    } catch (error) {
      if (error instanceof InvalidJwtTokenException) {
        throw new InternalServerErrorException(error.message)
      }
      throw new InternalServerErrorException('password reset failed')
    }
  }
}
