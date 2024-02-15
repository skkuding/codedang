'use client'

import { cn } from '@/lib/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { IconType } from 'react-icons'
import { FaChartBar, FaUser, FaBell, FaPen, FaTrophy } from 'react-icons/fa6'

export default function Page() {
  const pathname = usePathname()

  const navItems: { name: string; path: Route; icon: IconType }[] = [
    { name: 'Dashboard', path: '/admin', icon: FaChartBar },
    { name: 'User', path: '/admin/user', icon: FaUser },
    { name: 'Notice', path: '/admin/notice', icon: FaBell },
    { name: 'Problem', path: '/admin/problem', icon: FaPen },
    { name: 'Contest', path: '/admin/contest', icon: FaTrophy }
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
    </div>
  )
}
