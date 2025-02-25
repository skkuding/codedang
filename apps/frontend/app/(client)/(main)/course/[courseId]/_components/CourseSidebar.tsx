'use client'

import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/libs/utils'
import { motion } from 'framer-motion'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6'
import { CourseInfoBox } from './CourseInfoBox'
import { AssignmentIcon, GradeIcon } from './SidebarIcons'

interface CourseSidebarProps {
  courseId: string
}

export function CourseSidebar({ courseId }: CourseSidebarProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  const pathname = usePathname()

  const navItems = [
    {
      name: 'Assignment',
      path: `/course/${courseId}/assignment` as const,
      icon: (
        <AssignmentIcon
          fill={
            pathname === `/course/${courseId}/assignment` ? 'white' : '#8A8A8A'
          }
        />
      )
    },
    {
      name: 'Grade',
      path: `/course/${courseId}/grade` as const,
      icon: (
        <GradeIcon
          fill={pathname === `/course/${courseId}/grade` ? 'white' : '#8A8A8A'}
        />
      )
    }
  ]

  return (
    <div className="flex flex-col">
      <motion.div
        initial={{ width: 240 }}
        animate={{ width: isSidebarExpanded ? 240 : 48 }}
        className="relative flex flex-col"
      >
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute right-4 top-12 text-gray-500 hover:text-gray-700"
        >
          {isSidebarExpanded ? (
            <FaAnglesLeft className="text-[#9B9B9B]" />
          ) : (
            <FaAnglesRight className="text-[#9B9B9B]" />
          )}
        </button>
        {isSidebarExpanded && <CourseInfoBox courseId={courseId} />}
        <Separator className={cn(isSidebarExpanded ? 'my-6' : 'hidden')} />
        <nav
          className={cn('flex flex-col gap-2', !isSidebarExpanded && 'mt-36')}
        >
          {navItems.map((item) => (
            <SidebarLink
              key={item.name}
              item={item}
              isActive={pathname === item.path}
              isExpanded={isSidebarExpanded}
            />
          ))}
        </nav>
      </motion.div>
    </div>
  )
}

interface NavItem<T extends string> {
  name: string
  path: Route<T>
  icon: React.ReactNode
}

function SidebarLink<T extends string>({
  item,
  isActive,
  isExpanded
}: {
  item: NavItem<T>
  isActive: boolean
  isExpanded: boolean
}) {
  return (
    <Link
      href={item.path}
      className={cn(
        'flex items-center px-4 py-2 transition',
        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100',
        isExpanded ? 'rounded-full' : 'rounded'
      )}
    >
      {item.icon}
      {isExpanded && <span className="ml-3 text-sm">{item.name}</span>}
    </Link>
  )
}
