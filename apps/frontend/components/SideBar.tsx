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
    <div className="flex flex-col gap-2">
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
      className={cn(
        'flex items-center px-4 py-2 transition',
        isActive ? 'bg-primary text-white' : 'text-[#474747] hover:bg-gray-100',
        isExpanded ? 'w-48 rounded-full' : 'rounded-xs'
      )}
    >
      <item.icon
        className={cn('h-4 w-4', isActive ? 'fill-white' : 'fill-gray-600')}
      />
      {isExpanded && <span className="text-body4_r_14 ml-3">{item.name}</span>}
    </Link>
  )
}
