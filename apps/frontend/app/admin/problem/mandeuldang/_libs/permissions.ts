export const MANDEULDANG_ROLES = ['Owner', 'Editor', 'Reviewer'] as const

export type MandeuldangRole = (typeof MANDEULDANG_ROLES)[number]

export interface MandeuldangPermissions {
  role: MandeuldangRole | null
  isOwner: boolean
  isEditor: boolean
  isReviewer: boolean
  isReadOnly: boolean
  canCreateProblem: boolean
  canDeleteProblem: boolean
  canReadProblem: boolean
  canEditStatement: boolean
  canSaveProblem: boolean
  canUploadSolution: boolean
  canManageGenerator: boolean
  canManageValidator: boolean
  canCreateOutput: boolean
  canManageChecker: boolean
  canInviteCollaborator: boolean
  canApproveInvitation: boolean
  canChangeParticipantRole: boolean
  canPublishProblem: boolean
}

export function getMandeuldangPermissions(
  role: MandeuldangRole | null | undefined
): MandeuldangPermissions {
  const normalizedRole = role ?? null
  const isOwner = normalizedRole === 'Owner'
  const isEditor = normalizedRole === 'Editor'
  const isReviewer = normalizedRole === 'Reviewer'
  const canEditProblem = isOwner || isEditor

  return {
    role: normalizedRole,
    isOwner,
    isEditor,
    isReviewer,
    isReadOnly: isReviewer,
    canCreateProblem: isOwner,
    canDeleteProblem: isOwner,
    canReadProblem: Boolean(role),
    canEditStatement: canEditProblem,
    canSaveProblem: canEditProblem,
    canUploadSolution: canEditProblem,
    canManageGenerator: canEditProblem,
    canManageValidator: canEditProblem,
    canCreateOutput: canEditProblem,
    canManageChecker: canEditProblem,
    canInviteCollaborator: canEditProblem,
    canApproveInvitation: isOwner,
    canChangeParticipantRole: isOwner,
    canPublishProblem: isOwner
  }
}
