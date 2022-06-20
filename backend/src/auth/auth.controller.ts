import { Controller, Inject } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(@Inject('auth') private readonly authService: AuthService) {}
}
