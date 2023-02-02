import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'
import { IS_AUTH_NEEDED_KEY } from 'src/common/decorator/auth-ignore.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isAuthNeeded = this.reflector.getAllAndOverride<boolean>(
      IS_AUTH_NEEDED_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (!isAuthNeeded) {
      return true
    }
    return super.canActivate(context)
  }
}
