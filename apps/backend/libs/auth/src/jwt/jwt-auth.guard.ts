import {
  type ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import type { Socket } from 'socket.io'
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

    let groupId = request.query?.groupId
    if (context.getType() === 'ws') {
      const data = context.switchToWs().getData()
      groupId = data?.groupId || groupId
    }

    if (isAuthNotNeeded && !groupId) {
      return true
    }
    return super.canActivate(context)
  }

  getRequest(context: ExecutionContext) {
    if (context.getType<GqlContextType>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req
    }

    if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient<Socket>()
      const handshake = client.handshake

      if (handshake.auth?.token) {
        handshake.headers.authorization = `Bearer ${handshake.auth.token}`
      }

      return handshake
    }

    return super.getRequest(context)
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const request = this.getRequest(context)
    let groupId = request.query?.groupId

    if (context.getType() === 'ws') {
      const data = context.switchToWs().getData()
      groupId = data?.groupId || groupId
    }

    const userNullWhenAuthFailed = this.reflector.getAllAndOverride<boolean>(
      USER_NULL_WHEN_AUTH_FAILED,
      [context.getHandler(), context.getClass()]
    )
    if (userNullWhenAuthFailed && info && !groupId) {
      return null
    }
    if (err || !user) {
      throw err || new UnauthorizedException()
    }
    return user
  }
}
