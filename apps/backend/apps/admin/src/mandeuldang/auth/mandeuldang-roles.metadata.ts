import type { CollaboratorRole } from '@prisma/client'

export const MANDEULDANG_ROLES_KEY = 'mandeuldang:roles'

export interface MandeuldangRolesOptions {
  roles: readonly CollaboratorRole[]
  problemIdPath: 'id' | 'problemId' | 'input.id' | 'input.problemId'
  /** Published 문제의 조회를 허용합니다. */
  allowPublished?: boolean
  /** Admin의 조회를 허용합니다. */
  allowAdmin?: boolean
}
