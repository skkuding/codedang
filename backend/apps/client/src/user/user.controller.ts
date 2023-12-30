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
  ConflictException,
  Delete,
  Query
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Request, type Response } from 'express'
import { AuthenticatedRequest, AuthNotNeeded } from '@libs/auth'
import {
  UnprocessableDataException,
  InvalidJwtTokenException,
  DuplicateFoundException,
  UnidentifiedException,
  ConflictFoundException
} from '@libs/exception'
import { DeleteUserDto } from './dto/deleteUser.dto'
import { EmailAuthenticationPinDto } from './dto/email-auth-pin.dto'
import { NewPasswordDto } from './dto/newPassword.dto'
import { SignUpDto } from './dto/signup.dto'
import { SocialSignUpDto } from './dto/social-signup.dto'
import { UpdateUserEmailDto } from './dto/update-user-email.dto'
import { UpdateUserProfileDto } from './dto/update-userprofile.dto'
import { UserEmailDto } from './dto/userEmail.dto'
import { UsernameDto } from './dto/username.dto'
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
      this.logger.error(error)
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
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Post('social-sign-up')
  @AuthNotNeeded()
  async socialSignUp(@Body() socialSignUpDto: SocialSignUpDto) {
    try {
      return await this.userService.socialSignUp(socialSignUpDto)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof DuplicateFoundException) {
        throw new ConflictException(error.message)
      } else if (error instanceof InvalidJwtTokenException) {
        throw new UnauthorizedException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Delete()
  async deleteUser(
    @Req() req: AuthenticatedRequest,
    @Body() deleteUserDto: DeleteUserDto
  ) {
    try {
      await this.userService.deleteUser(
        req.user.username,
        deleteUserDto.password
      )
    } catch (error) {
      if (
        error instanceof UnidentifiedException ||
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.name === 'RecordNotFound')
      ) {
        throw new UnauthorizedException(error.message)
      } else if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error)
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
      this.logger.error(error)
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
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Patch('profile')
  async updateUserProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserProfileDto: UpdateUserProfileDto
  ) {
    try {
      return await this.userService.updateUserProfile(
        req.user.id,
        updateUserProfileDto
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('username-check')
  @AuthNotNeeded()
  async checkDuplicatedUsername(@Query() usernameDto: UsernameDto) {
    try {
      return await this.userService.checkDuplicatedUsername(usernameDto)
    } catch (error) {
      if (error instanceof DuplicateFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error)
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
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Post('send-email/register-new')
  async sendPinForRegisterNewEmail(@Body() userEmailDto: UserEmailDto) {
    try {
      return await this.userService.sendPinForRegisterNewEmail(userEmailDto)
    } catch (error) {
      if (error instanceof DuplicateFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error)
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
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
