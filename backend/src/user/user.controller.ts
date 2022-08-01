import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Patch,
  UnprocessableEntityException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { UserProfile } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
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
import { SignUpDto } from './dto/sign-up.dto'
import { UpdateUserRealNameDto } from './dto/update-user-realname.dto'
import { WithdrawalDto } from './dto/withdrawal.dto'
import { UserService } from './user.service'
import { UserEmailDto } from './dto/userEmail.dto'
import { NewPasswordDto } from './dto/newPassword.dto'
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
  async createPinAndSendEmail(
    @Body() userEmailDto: UserEmailDto
  ): Promise<string> {
    try {
      return await this.userService.createPinAndSendEmail(userEmailDto)
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

  @Post('/signup')
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateUserRealName(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserRealNameDto: UpdateUserRealNameDto
  ): Promise<UserProfile> {
    try {
      return await this.userService.updateUserRealName(
        req.user.id,
        updateUserRealNameDto
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
