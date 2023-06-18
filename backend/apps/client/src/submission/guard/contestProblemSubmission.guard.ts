import { type AuthenticatedUser } from '@client/auth/class/authenticated-user.class'
import {
  Injectable,
  type CanActivate,
  type ExecutionContext
} from '@nestjs/common'
import type { Observable } from 'rxjs'

// Not Implemented yet

@Injectable()
export class ContestProblemSubmissionGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const user: AuthenticatedUser = request.user

    if (user.isAdmin() || user.isSuperAdmin()) {
      return true
    }

    // const contestId: number = parseInt(request.params.contestId)
    // const userId: number = request.user.id

    return true
  }
}
