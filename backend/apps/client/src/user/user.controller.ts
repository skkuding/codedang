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
  Controller,
  NotFoundException
} from '@nestjs/common'
import type { UserProfile, User } from '@prisma/client'
import { Request, type Response } from 'express'
import { AuthenticatedRequest } from '@client/auth/interface/authenticated-request.interface'
import {
  EntityNotExistException,
  InvalidUserException,
  UnprocessableDataException,
  EmailTransmissionFailedException,
  InvalidJwtTokenException,
  InvalidPinException
} from '@client/common/exception/business.exception'
import { AuthNotNeeded } from '../common/decorator/auth-ignore.decorator'
import { EmailAuthensticationPinDto } from './dto/email-auth-pin.dto'
import type { GetUserProfileDto } from './dto/get-userprofile.dto'
import { NewPasswordDto } from './dto/newPassword.dto'
import { SignUpDto } from './dto/signup.dto'
import { UpdateUserEmailDto } from './dto/update-user-email.dto'
import { UpdateUserProfileRealNameDto } from './dto/update-userprofile-realname.dto'
import { UserEmailDto } from './dto/userEmail.dto'
import { WithdrawalDto } from './dto/withdrawal.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('/password-reset')
  @AuthNotNeeded()
  async updatePassword(
    @Body() newPasswordDto: NewPasswordDto,
    @Req() req: Request
  ): Promise<string> {
    try {
      return await this.userService.updatePassword(newPasswordDto, req)
    } catch (error) {
      if (error instanceof InvalidJwtTokenException) {
        throw new UnauthorizedException(error.message)
      } else if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      throw new InternalServerErrorException('password reset failed')
    }
  }

  @Post('/sign-up')
  @AuthNotNeeded()
  async signUp(@Body() signUpDto: SignUpDto, @Req() req: Request) {
    try {
      await this.userService.signUp(req, signUpDto)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof InvalidJwtTokenException) {
        throw new UnauthorizedException(error.message)
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
      return await this.userService.updateUserEmail(req, updateUserEmail)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof InvalidJwtTokenException) {
        throw new UnauthorizedException(error.message)
      } else if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
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
@AuthNotNeeded()
export class EmailAuthenticationController {
  constructor(private readonly userService: UserService) {}

  setJwtInHeader(res: Response, jwt: string) {
    res.setHeader('email-auth', `${jwt}`)
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

  @Post('/send-email/register-new')
  async sendPinForRegisterNewEmail(
    @Body() userEmailDto: UserEmailDto
  ): Promise<string> {
    try {
      return await this.userService.sendPinForRegisterNewEmail(userEmailDto)
    } catch (error) {
      if (error instanceof EmailTransmissionFailedException) {
        throw new InternalServerErrorException(error.message)
      } else if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      console.error(error)
      throw new InternalServerErrorException(error.message)
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
