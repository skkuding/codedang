'use client'

import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/libs/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { IconType } from 'react-icons'
import { FaChartBar, FaPen } from 'react-icons/fa6'
import { GroupLink } from './GroupLink'

export function GroupAdminSideBar() {
  const pathname = usePathname()

  const navItems: { name: string; path: Route; icon: IconType }[] = [
    { name: 'Dashboard', path: '/admin', icon: FaChartBar },
    { name: 'My Problems', path: '/admin/problem', icon: FaPen },
    { name: 'My Courses', path: '/admin/course', icon: FaPen }
  ]

  return (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.path}
          className={cn(
            'rounded px-4 py-2 transition',
            (
              item.path === '/admin'
                ? pathname === item.path
                : pathname.startsWith(item.path)
            )
              ? 'bg-primary text-white hover:opacity-95'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          {item.icon && <item.icon className="mr-2 inline-block" />}
          {item.name}
        </Link>
      ))}
      <Separator className="my-4 transition" />
      <GroupLink />
    </div>
  )
}
