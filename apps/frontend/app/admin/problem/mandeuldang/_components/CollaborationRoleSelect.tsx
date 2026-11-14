import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { cn } from '@/libs/utils'
import {
  COLLABORATOR_ROLES,
  type CollaboratorRole
} from '../_libs/collaboration'

interface CollaborationRoleSelectProps {
  ariaLabel: string
  value: CollaboratorRole
  onValueChange: (role: CollaboratorRole) => void
  compact?: boolean
}

export function CollaborationRoleSelect({
  ariaLabel,
  value,
  onValueChange,
  compact = false
}: CollaborationRoleSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) =>
        onValueChange(nextValue as CollaboratorRole)
      }
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          // 피그마: 화살표 20px #242626, 행 드롭다운 109×44 CoolNeutral/20, 폼 셀렉트 46 CoolNeutral/5
          'text-body1_m_16 border-color-line [&>svg]:text-color-cool-neutral-15 bg-white pl-5 pr-4 [&>svg]:size-5 [&>svg]:opacity-100',
          compact
            ? 'text-color-cool-neutral-20 h-11 w-[109px] rounded-full'
            : 'text-color-cool-neutral-5 h-[46px] w-full rounded-xl'
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-lg bg-white shadow-md">
        {COLLABORATOR_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
