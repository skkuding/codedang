'use client'

import { useState } from 'react'
import type { MandeuldangRole } from '../_libs/permissions'
import { useMandeuldangPermission } from '../_libs/useMandeuldangPermission'
import { MandeuldangRoleSwitchButton } from './MandeuldangRoleSwitchButton'

export function StatementPage() {
  const [role, setRole] = useState<MandeuldangRole | null>('Owner')
  const permissions = useMandeuldangPermission(role)

  const enabledPermissionNames = [
    { name: 'canCreateProblem', enabled: permissions.canCreateProblem },
    { name: 'canDeleteProblem', enabled: permissions.canDeleteProblem },
    { name: 'canReadProblem', enabled: permissions.canReadProblem },
    { name: 'canEditStatement', enabled: permissions.canEditStatement },
    { name: 'canSaveProblem', enabled: permissions.canSaveProblem },
    { name: 'canUploadSolution', enabled: permissions.canUploadSolution },
    { name: 'canManageGenerator', enabled: permissions.canManageGenerator },
    { name: 'canManageValidator', enabled: permissions.canManageValidator },
    { name: 'canCreateOutput', enabled: permissions.canCreateOutput },
    { name: 'canManageChecker', enabled: permissions.canManageChecker },
    {
      name: 'canInviteCollaborator',
      enabled: permissions.canInviteCollaborator
    },
    { name: 'canApproveInvitation', enabled: permissions.canApproveInvitation },
    {
      name: 'canChangeParticipantRole',
      enabled: permissions.canChangeParticipantRole
    },
    { name: 'canPublishProblem', enabled: permissions.canPublishProblem },
    { name: 'isReadOnly', enabled: permissions.isReadOnly }
  ]
    .filter(({ enabled }) => enabled)
    .map(({ name }) => name)

  return (
    <div>
      <div>This is Statement page</div>
      <div>now role : {permissions.role ?? 'None'}</div>
      <MandeuldangRoleSwitchButton role={role} setRole={setRole} />
      <div className="mt-4">
        <p>current permissions</p>
        <ul>
          {enabledPermissionNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
