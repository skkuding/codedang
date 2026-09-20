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
  isSidebarExpanded: boolean
  defaultItem?: string
}

export function SideBar({
  navItems,
  isSidebarExpanded,
  defaultItem
}: SideBarProps) {
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
          isExpanded={isSidebarExpanded}
        />
      ))}
    </div>
  )
}

interface SidebarLinkProps {
  item: NavItem
  isActive: boolean
  isExpanded: boolean
}

function SidebarLink({ item, isActive, isExpanded }: SidebarLinkProps) {
  return (
    <Link
      href={item.path as Route}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-[46px] w-full items-center gap-2.5 px-4 py-3 transition-colors',
        isActive
          ? 'bg-primary text-white'
          : 'text-color-neutral-30 hover:bg-color-neutral-99',
        isExpanded ? 'rounded-full' : 'justify-center rounded-full px-3'
      )}
    >
      <item.icon
        className={cn(
          'size-[18px] shrink-0',
          isActive
            ? 'fill-white text-white'
            : 'fill-color-neutral-70 text-color-neutral-70'
        )}
      />
      {isExpanded && <span className="text-sub3_sb_16">{item.name}</span>}
    </Link>
  )
}
