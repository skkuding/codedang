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
  NotFoundException,
  Logger,
  ConflictException
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Request, type Response } from 'express'
import { AuthenticatedRequest, AuthNotNeeded } from '@libs/auth'
import {
  UnprocessableDataException,
  EmailTransmissionFailedException,
  InvalidJwtTokenException,
  DuplicateFoundException,
  UnidentifiedException
} from '@libs/exception'
import { EmailAuthenticationPinDto } from './dto/email-auth-pin.dto'
import { NewPasswordDto } from './dto/newPassword.dto'
import { SignUpDto } from './dto/signup.dto'
import { UpdateUserEmailDto } from './dto/update-user-email.dto'
import { UpdateUserProfileRealNameDto } from './dto/update-userprofile-realname.dto'
import { UserEmailDto } from './dto/userEmail.dto'
import { WithdrawalDto } from './dto/withdrawal.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name)

  constructor(private readonly userService: UserService) {}

  @Patch('password-reset')
  @AuthNotNeeded()
  async updatePassword(
    @Body() newPasswordDto: NewPasswordDto,
    @Req() req: Request
  ) {
    try {
      return await this.userService.updatePassword(newPasswordDto, req)
    } catch (error) {
      if (error instanceof UnidentifiedException) {
        throw new UnauthorizedException(error.message)
      } else if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException('password reset failed')
    }
  }

  @Post('sign-up')
  @AuthNotNeeded()
  async signUp(@Body() signUpDto: SignUpDto, @Req() req: Request) {
    try {
      await this.userService.signUp(req, signUpDto)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof DuplicateFoundException) {
        throw new ConflictException(error.message)
      } else if (error instanceof InvalidJwtTokenException) {
        throw new UnauthorizedException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Post('withdrawal')
  async withdrawal(
    @Req() req: AuthenticatedRequest,
    @Body() withdrawalDto: WithdrawalDto
  ) {
    try {
      await this.userService.withdrawal(req.user.username, withdrawalDto)
    } catch (error) {
      if (
        error instanceof UnidentifiedException ||
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.name === 'NotFoundError')
      ) {
        throw new UnauthorizedException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getUserProfile(@Req() req: AuthenticatedRequest) {
    try {
      return await this.userService.getUserProfile(req.user.username)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Patch('email')
  async updateUserEmail(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserEmail: UpdateUserEmailDto
  ) {
    try {
      return await this.userService.updateUserEmail(req, updateUserEmail)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof InvalidJwtTokenException) {
        throw new UnauthorizedException(error.message)
      } else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Patch('realname')
  async updateUserProfileRealName(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserProfileRealNameDto: UpdateUserProfileRealNameDto
  ) {
    try {
      return await this.userService.updateUserProfileRealName(
        req.user.id,
        updateUserProfileRealNameDto
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('email-auth')
@AuthNotNeeded()
export class EmailAuthenticationController {
  private readonly logger = new Logger(EmailAuthenticationController.name)

  constructor(private readonly userService: UserService) {}

  setJwtInHeader(res: Response, jwt: string) {
    res.setHeader('email-auth', `${jwt}`)
  }

  @Post('send-email/password-reset')
  async sendPinForPasswordReset(@Body() userEmailDto: UserEmailDto) {
    try {
      return await this.userService.sendPinForPasswordReset(userEmailDto)
    } catch (error) {
      if (error instanceof UnidentifiedException) {
        throw new UnauthorizedException(error.message)
      } else if (error instanceof EmailTransmissionFailedException) {
        this.logger.error(error.message, error.stack)
        throw new InternalServerErrorException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Post('send-email/register-new')
  async sendPinForRegisterNewEmail(@Body() userEmailDto: UserEmailDto) {
    try {
      return await this.userService.sendPinForRegisterNewEmail(userEmailDto)
    } catch (error) {
      if (error instanceof EmailTransmissionFailedException) {
        throw new InternalServerErrorException(error.message)
      } else if (error instanceof DuplicateFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException(error.message)
    }
  }

  @Post('verify-pin')
  async verifyPinAndIssueJwt(
    @Res({ passthrough: true }) res,
    @Body() emailAuthenticationpinDto: EmailAuthenticationPinDto
  ) {
    try {
      const jwt = await this.userService.verifyPinAndIssueJwt(
        emailAuthenticationpinDto
      )
      this.setJwtInHeader(res, jwt)
    } catch (error) {
      if (error instanceof UnidentifiedException) {
        throw new UnauthorizedException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}
