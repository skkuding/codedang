import { Role } from '@prisma/client'

export interface AuthenticatedUser {
  id: number
  username: string
  role?: Role
}
