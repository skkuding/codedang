import { type ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import { type Observable } from 'rxjs'
import { IS_AUTH_NOT_NEEDED_KEY } from '@client/common/decorator/auth-ignore.decorator'

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

  getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest()
    } else if (context.getType<GqlContextType>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req
    }
  }
}
