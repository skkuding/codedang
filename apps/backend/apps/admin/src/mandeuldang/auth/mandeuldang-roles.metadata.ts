import type { CollaboratorRole } from '@prisma/client'

export const MANDEULDANG_ROLES_KEY = 'mandeuldang:roles'

export interface MandeuldangRolesOptions {
  roles: readonly CollaboratorRole[]
  problemIdPath: 'id' | 'problemId' | 'input.id' | 'input.problemId'
}
