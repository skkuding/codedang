import {
  type ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  AUTH_NOT_NEEDED_KEY,
  USER_NULL_WHEN_AUTH_FAILED
} from '../guard.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const request = this.getRequest(context)
    const isAuthNotNeeded = this.reflector.getAllAndOverride<boolean>(
      AUTH_NOT_NEEDED_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (
      isAuthNotNeeded &&
      (!request.query.groupId || request.query.groupId === '1')
    ) {
      return true
    }
    return super.canActivate(context)
  }

  getRequest(context: ExecutionContext) {
    if (context.getType<GqlContextType>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req
    }
    return super.getRequest(context)
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const request = this.getRequest(context)
    const groupId = request.query.groupId ?? `${OPEN_SPACE_ID}`
    const userNullWhenAuthFailed = this.reflector.getAllAndOverride<boolean>(
      USER_NULL_WHEN_AUTH_FAILED,
      [context.getHandler(), context.getClass()]
    )
    if (userNullWhenAuthFailed && info && groupId === `${OPEN_SPACE_ID}`) {
      return null
    }
    if (err || !user) {
      throw err || new UnauthorizedException()
    }
    return user
  }
}
