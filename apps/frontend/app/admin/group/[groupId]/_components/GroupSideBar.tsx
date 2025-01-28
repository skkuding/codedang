'use client'

import { cn } from '@/libs/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { IconType } from 'react-icons'
import {
  MdAssignment,
  MdHome,
  MdNotifications,
  MdRateReview,
  MdOutlineQuestionAnswer,
  MdEditDocument,
  MdPeople
} from 'react-icons/md'

interface GroupSideBarProps {
  groupId: string
}

export function GroupSideBar({ groupId }: GroupSideBarProps) {
  const pathname = usePathname()

  const navItems: { name: string; path: string; icon: IconType }[] = [
    { name: 'Home', path: `/admin/group/${groupId}`, icon: MdHome },
    {
      name: 'Notice',
      path: `/admin/group/${groupId}/notice`,
      icon: MdNotifications
    },
    {
      name: 'User',
      path: `/admin/group/${groupId}/user`,
      icon: MdPeople
    },
    {
      name: 'Assignment',
      path: `/admin/group/${groupId}/assignment`,
      icon: MdAssignment
    },
    {
      name: 'Exam',
      path: `/admin/group/${groupId}/exam`,
      icon: MdEditDocument
    },
    {
      name: 'Grade',
      path: `/admin/group/${groupId}/grade`,
      icon: MdRateReview
    },
    {
      name: 'Q&A',
      path: `/admin/group/${groupId}/qna`,
      icon: MdOutlineQuestionAnswer
    }
  ]

  return (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.path as Route}
          className={cn(
            'rounded px-4 py-2 transition',
            pathname === item.path
              ? 'bg-primary text-white hover:opacity-95'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          {item.icon && <item.icon className="mr-2 inline-block h-5 w-5" />}
          {item.name}
        </Link>
      ))}
    </div>
  )
}
