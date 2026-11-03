'use client'

import { cn } from '@/libs/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType } from 'react'
import type { IconType } from 'react-icons'

interface NavItem {
  name: string
  path: string
  icon: IconType | ComponentType<{ className: string }>
}

interface SideBarProps {
  navItems: NavItem[]
  defaultItem?: string
}

export function SideBar({ navItems, defaultItem }: SideBarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-1.5">
      {navItems.map((item) => (
        <SidebarLink
          key={item.name}
          item={item}
          isActive={
            defaultItem && item.name === defaultItem
              ? pathname === item.path
              : pathname.startsWith(item.path)
          }
        />
      ))}
    </div>
  )
}

interface SidebarLinkProps {
  item: NavItem
  isActive: boolean
}

function SidebarLink({ item, isActive }: SidebarLinkProps) {
  return (
    <Link
      href={item.path as Route}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-[46px] w-full items-center gap-2.5 rounded-full px-4 py-3 transition-colors',
        isActive
          ? 'bg-primary text-white'
          : 'text-color-neutral-30 hover:bg-color-neutral-99'
      )}
    >
      <item.icon
        className={cn(
          'size-[18px] shrink-0',
          isActive ? 'text-white' : 'text-color-neutral-70'
        )}
      />
      <span className="text-sub3_sb_16">{item.name}</span>
    </Link>
  )
}
