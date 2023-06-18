import { type AuthenticatedUser } from '@client/auth/class/authenticated-user.class'
import {
  Injectable,
  type CanActivate,
  type ExecutionContext
} from '@nestjs/common'
import type { Observable } from 'rxjs'

// Not Implemented yet

@Injectable()
export class WorkbookProblemSubmissionGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const user: AuthenticatedUser = request.user

    if (user.isAdmin() || user.isSuperAdmin()) {
      return true
    }

    // const workbookId: number = parseInt(request.params.workbookId)
    // const userId: number = request.user.id

    return true
  }
}
