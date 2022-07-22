import {
  Body,
  Controller,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UnauthorizedException
} from '@nestjs/common'
import { UserService } from './user.service'
import { UserEmailDto } from './userEmail.dto'
import { NewPasswordDto } from './newPassword.dto'
import { InvalidUserException } from 'src/common/exception/business.exception'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/password/reset')
  createTokenAndSendEmail(@Body() userEmailDto: UserEmailDto): Promise<string> {
    try {
      return this.userService.createTokenAndSendEmail(userEmailDto)
    } catch (error) {
      if (error instanceof InvalidUserException) {
        throw new UnauthorizedException(error.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  @Patch('/:userId/password/reset/:resetToken')
  updatePassword(
    @Body() newPasswordDto: NewPasswordDto,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('resetToken') resetToken: string
  ): Promise<string> {
    try {
      return this.userService.updatePassword(userId, resetToken, newPasswordDto)
    } catch (error) {
      throw new InternalServerErrorException('password reset failed')
    }
  }
}
