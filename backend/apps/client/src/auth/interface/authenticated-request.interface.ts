import { type Request } from 'express'
import { type AuthenticatedUser } from '../class/authenticated-user.class'

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
}
