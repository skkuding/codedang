import type { Request } from 'express'
import type { AuthenticatedUser } from '@libs/auth'

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
}
