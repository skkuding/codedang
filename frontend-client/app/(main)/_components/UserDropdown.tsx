import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { LogOut, User, UserRoundCog } from 'lucide-react'
import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface UserDropdownMenuProps {
  session: Session | null
}

export default function UserDropdownMenu({ session }: UserDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-2 px-4 py-1">
        <p className="text-primary font-bold">{session?.user.username}</p>
        <User className="text-gray-500" width={24} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {session?.user.role !== 'User' && (
          <Link href="/admin">
            <DropdownMenuItem className="flex cursor-pointer items-center gap-1 font-semibold">
              <UserRoundCog className="size-4" /> Management
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-1 font-semibold"
          onClick={() => {
            signOut()
          }}
        >
          <LogOut className="size-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
