import { Request } from 'express'
import { AuthenticatedUser } from '../class/authenticated-user.class'

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
}
