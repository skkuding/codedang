import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { cn } from '@/libs/utils'
import CheckIcon from '@/public/icons/check.svg'
import MoreIcon from '@/public/icons/more.svg'
import SettingsIcon from '@/public/icons/settings.svg'
import Image from 'next/image'
import Link from 'next/link'

interface NotificationOptionsMenuProps {
  isLoading: boolean
  isEditor: boolean
  setIsOpen: (isOpen: boolean) => void
  handleMarkAllAsRead: () => void
}

export function NotificationOptionsMenu({
  isLoading,
  isEditor,
  setIsOpen,
  handleMarkAllAsRead
}: NotificationOptionsMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger disabled={isLoading}>
        <Image src={MoreIcon} alt="filter" width={24} height={24} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'w-52 py-2',
          isEditor && 'border-slate-600 bg-slate-700 text-white'
        )}
      >
        <DropdownMenuItem
          onSelect={handleMarkAllAsRead}
          className={cn(
            'hover:!bg-color-neutral-99 flex cursor-pointer gap-2',
            isEditor && '!bg-slate-700 !text-gray-300 hover:!bg-slate-800'
          )}
        >
          <Image src={CheckIcon} alt="check" width={16} height={16} />
          Mark all as read
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            'hover:!bg-color-neutral-99 ml-[1px] flex gap-2.5',
            isEditor && '!bg-slate-700 !text-gray-300 hover:!bg-slate-800'
          )}
        >
          <Image src={SettingsIcon} alt="settings" width={13} height={12} />
          <Link onClick={() => setIsOpen(false)} href="/settings">
            Notification settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
