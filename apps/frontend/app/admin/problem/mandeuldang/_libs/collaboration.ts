export const COLLABORATOR_ROLES = ['Viewer', 'Editor'] as const

export type CollaboratorRole = (typeof COLLABORATOR_ROLES)[number]

export interface Collaborator {
  id: string
  name: string
  email: string
  role: CollaboratorRole
  avatarUrl?: string
}

export type CollaborationTab = 'requests' | 'participants'

export type PendingCollaborationAction =
  | {
      type: 'change-role'
      collaborator: Collaborator
      nextRole: CollaboratorRole
    }
  | {
      type: 'delete'
      collaborator: Collaborator
    }

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function nameFromEmail(email: string) {
  const localPart = email.split('@')[0]

  return localPart || email
}
