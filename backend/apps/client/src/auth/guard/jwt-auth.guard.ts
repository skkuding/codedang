import { type ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { type Observable } from 'rxjs'
import { IS_AUTH_NOT_NEEDED_KEY } from '~/common/decorator/auth-ignore.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isAuthNotNeeded = this.reflector.getAllAndOverride<boolean>(
      IS_AUTH_NOT_NEEDED_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (isAuthNotNeeded) {
      return true
    }
    return super.canActivate(context)
  }
}
