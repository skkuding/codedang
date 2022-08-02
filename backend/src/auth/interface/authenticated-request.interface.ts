import { Request } from 'express'
import { AuthenticatedUser } from '../interface/authenticated-user.interface'

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
  userRole?: string
}
