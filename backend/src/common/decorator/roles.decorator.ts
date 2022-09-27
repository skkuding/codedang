import { SetMetadata } from '@nestjs/common'
import { Role } from '@prisma/client'

export const ROLES_KEY = 'role'
export const Roles = (role: Role) => SetMetadata(ROLES_KEY, role)
