'use client'

import { cn } from '@/libs/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaChartBar, FaUser, FaBell, FaPen, FaTrophy } from 'react-icons/fa6'

export function SideBar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', path: '/admin' as const, icon: FaChartBar },
    { name: 'User', path: '/admin/user' as const, icon: FaUser },
    { name: 'Notice', path: '/admin/notice' as const, icon: FaBell },
    { name: 'Problem', path: '/admin/problem' as const, icon: FaPen },
    { name: 'Contest', path: '/admin/contest' as const, icon: FaTrophy }
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
