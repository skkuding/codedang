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
          'text-body3_r_16 border-color-line bg-white pl-5 pr-4',
          compact ? 'h-10 w-[109px] rounded-full' : 'h-[46px] w-full rounded-xl'
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent showScrollButtons={false} className="rounded-lg p-0">
        {COLLABORATOR_ROLES.map((role) => (
          <SelectItem
            key={role}
            value={role}
            showSelectIcon={false}
            className="text-body3_r_16 focus:bg-color-neutral-95 h-10 justify-center rounded-none px-5"
          >
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
