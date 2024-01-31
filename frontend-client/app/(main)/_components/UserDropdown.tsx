import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { User } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface UserDropdownMenuProps {
  username: string
}

export default function UserDropdownMenu({ username }: UserDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-2 px-4 py-1">
        <p className="text-primary font-bold">{username}</p>
        <User className="text-gray-500" width={24} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="cursor-pointer font-semibold"
          // TODO: 설정 페이지 추가되면 라우팅 추가
          onClick={() => {
            console.log('Settings')
          }}
        >
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer font-semibold"
          onClick={() => {
            signOut()
          }}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
