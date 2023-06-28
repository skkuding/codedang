import type { Request } from 'express'
import type { AuthenticatedUser } from './authenticated-user.class'

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
}
