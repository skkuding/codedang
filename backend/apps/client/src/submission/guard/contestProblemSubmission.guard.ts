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
    return request ? true : false
  }
}
