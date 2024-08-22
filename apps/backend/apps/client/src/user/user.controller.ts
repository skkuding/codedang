import {
  Body,
  Get,
  Patch,
  Post,
  Req,
  Res,
  Controller,
  Logger,
  Delete,
  Query
} from '@nestjs/common'
import { Request, type Response } from 'express'
import { AuthenticatedRequest, AuthNotNeededIfOpenSpace } from '@libs/auth'
import { DeleteUserDto } from './dto/deleteUser.dto'
import { EmailAuthenticationPinDto } from './dto/email-auth-pin.dto'
import { NewPasswordDto } from './dto/newPassword.dto'
import { SignUpDto } from './dto/signup.dto'
import { SocialSignUpDto } from './dto/social-signup.dto'
import { UpdateUserEmailDto } from './dto/update-user-email.dto'
import { UpdateUserProfileDto } from './dto/update-userprofile.dto'
import { UpdateUserDto } from './dto/updateUser.dto'
import { UserEmailDto } from './dto/userEmail.dto'
import { UsernameDto } from './dto/username.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name)

  constructor(private readonly userService: UserService) {}

  @Patch('password-reset')
  @AuthNotNeededIfOpenSpace()
  async updatePassword(
    @Body() newPasswordDto: NewPasswordDto,
    @Req() req: Request
  ) {
    return await this.userService.updatePassword(newPasswordDto, req)
  }

  @Post('sign-up')
  @AuthNotNeededIfOpenSpace()
  async signUp(@Body() signUpDto: SignUpDto, @Req() req: Request) {
    await this.userService.signUp(req, signUpDto)
  }

  @Post('social-sign-up')
  @AuthNotNeededIfOpenSpace()
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

  @Patch('profile')
  async updateUserProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserProfileDto: UpdateUserProfileDto
  ) {
    return await this.userService.updateUserProfile(
      req.user.id,
      updateUserProfileDto
    )
  }

  @Get('username-check')
  @AuthNotNeededIfOpenSpace()
  async checkDuplicatedUsername(@Query() usernameDto: UsernameDto) {
    return await this.userService.checkDuplicatedUsername(usernameDto)
  }

  @Get('email')
  @AuthNotNeededIfOpenSpace()
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
@AuthNotNeededIfOpenSpace()
export class EmailAuthenticationController {
  private readonly logger = new Logger(EmailAuthenticationController.name)

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
