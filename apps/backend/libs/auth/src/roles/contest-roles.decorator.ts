import { SetMetadata } from '@nestjs/common'
import type { ContestRole } from '@prisma/client'

/** @public */
export const CONTEST_ROLES_KEY = 'contest_role'

/** @public */
export const ContestRoles = (role: ContestRole) =>
  SetMetadata(CONTEST_ROLES_KEY, role)
