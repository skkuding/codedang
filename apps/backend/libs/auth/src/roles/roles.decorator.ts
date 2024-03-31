import { SetMetadata } from '@nestjs/common'
import type { Role } from '@prisma/client'

/** @public */
export const ROLES_KEY = 'role'

/** @public */
export const Roles = (role: Role) => SetMetadata(ROLES_KEY, role)
