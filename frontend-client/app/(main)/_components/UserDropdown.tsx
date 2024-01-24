import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu'
import { User } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface UserDropdownMenuProps {
  username: string
}

type Checked = DropdownMenuCheckboxItemProps['checked']

export default function UserDropdownMenu({ username }: UserDropdownMenuProps) {
  const [showLogout, setShowLogout] = useState<Checked>(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-2 px-4 py-1">
        <p className="text-primary font-bold">{username}</p>
        <User className="text-gray-500" width={24} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={showLogout}
          onCheckedChange={setShowLogout}
          className="font-semibold"
          onClick={signOut}
        >
          Logout
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
