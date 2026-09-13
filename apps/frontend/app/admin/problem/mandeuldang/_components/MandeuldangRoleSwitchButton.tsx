'use client'

import { MANDEULDANG_ROLES, type MandeuldangRole } from '../_libs/permissions'

interface MandeuldangRoleSwitchButtonProps {
  role: MandeuldangRole | null
  setRole: (role: MandeuldangRole) => void
}

export function MandeuldangRoleSwitchButton({
  role,
  setRole
}: MandeuldangRoleSwitchButtonProps) {
  const switchRole = () => {
    const currentRoleIndex = role ? MANDEULDANG_ROLES.indexOf(role) : -1
    const nextRole =
      MANDEULDANG_ROLES[(currentRoleIndex + 1) % MANDEULDANG_ROLES.length]

    setRole(nextRole)
  }

  return (
    <button
      type="button"
      onClick={switchRole}
      className="border-color-cool-neutral-70 text-caption1_m_12 text-color-cool-neutral-20 hover:bg-color-cool-neutral-95 mt-2 rounded-md border bg-white px-3 py-2 shadow-md transition"
    >
      Switch role
    </button>
  )
}
