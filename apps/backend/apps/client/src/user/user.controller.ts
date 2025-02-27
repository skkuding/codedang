import {
  Body,
  Get,
  Patch,
  Post,
  Req,
  Res,
  Controller,
  Delete,
  Query
} from '@nestjs/common'
import { Request, type Response } from 'express'
import { AuthenticatedRequest, AuthNotNeededIfPublic } from '@libs/auth'
import { DeleteUserDto } from './dto/deleteUser.dto'
import { EmailAuthenticationPinDto } from './dto/email-auth-pin.dto'
import { NewPasswordDto } from './dto/newPassword.dto'
import { SignUpDto } from './dto/signup.dto'
import { SocialSignUpDto } from './dto/social-signup.dto'
import { UpdateUserEmailDto } from './dto/update-user-email.dto'
import { UpdateUserDto } from './dto/updateUser.dto'
import { UserEmailDto } from './dto/userEmail.dto'
import { UsernameDto } from './dto/username.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('password-reset')
  @AuthNotNeededIfPublic()
  async updatePassword(
    @Body() newPasswordDto: NewPasswordDto,
    @Req() req: Request
  ) {
    return await this.userService.updatePassword(newPasswordDto, req)
  }

  @Post('sign-up')
  @AuthNotNeededIfPublic()
  async signUp(@Body() signUpDto: SignUpDto, @Req() req: Request) {
    await this.userService.signUp(req, signUpDto)
  }

  @Post('social-sign-up')
  @AuthNotNeededIfPublic()
  async socialSignUp(@Body() socialSignUpDto: SocialSignUpDto) {
    return await this.userService.socialSignUp(socialSignUpDto)
  }

  @Delete()
  async deleteUser(
    @Req() req: AuthenticatedRequest,
    @Body() deleteUserDto: DeleteUserDto
  ) {
    await this.userService.deleteUser(req.user.username, deleteUserDto.password)
  }

  @Get()
  async getUserProfile(@Req() req: AuthenticatedRequest) {
    return await this.userService.getUserProfile(req.user.username)
  }

  @Patch('email')
  async updateUserEmail(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserEmail: UpdateUserEmailDto
  ) {
    return await this.userService.updateUserEmail(req, updateUserEmail)
  }

  @Get('username-check')
  @AuthNotNeededIfPublic()
  async checkDuplicatedUsername(@Query() usernameDto: UsernameDto) {
    return await this.userService.checkDuplicatedUsername(usernameDto)
  }

  @Get('email')
  @AuthNotNeededIfPublic()
  async getUsernameByEmail(@Query() userEmailDto: UserEmailDto) {
    return await this.userService.getUsernameByEmail(userEmailDto)
  }

  @Patch('')
  async updateUser(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return await this.userService.updateUser(req, updateUserDto)
  }
}

@Controller('email-auth')
@AuthNotNeededIfPublic()
export class EmailAuthenticationController {
  constructor(private readonly userService: UserService) {}

  setJwtInHeader(res: Response, jwt: string) {
    res.setHeader('email-auth', `${jwt}`)
  }

  @Post('send-email/password-reset')
  async sendPinForPasswordReset(@Body() userEmailDto: UserEmailDto) {
    return await this.userService.sendPinForPasswordReset(userEmailDto)
  }

  @Post('send-email/register-new')
  async sendPinForRegisterNewEmail(@Body() userEmailDto: UserEmailDto) {
    return await this.userService.sendPinForRegisterNewEmail(userEmailDto)
  }

  @Post('verify-pin')
  async verifyPinAndIssueJwt(
    @Res({ passthrough: true }) res,
    @Body() emailAuthenticationpinDto: EmailAuthenticationPinDto
  ) {
    const jwt = await this.userService.verifyPinAndIssueJwt(
      emailAuthenticationpinDto
    )
    this.setJwtInHeader(res, jwt)
  }
}
