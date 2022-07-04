import { Request } from 'express'
import { AuthenticatedUser } from '../type/jwt.type'

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
}
