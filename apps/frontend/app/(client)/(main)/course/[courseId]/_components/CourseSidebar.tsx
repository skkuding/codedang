'use client'

import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/libs/utils'
import assignmentIcon from '@/public/icons/assignment.svg'
import gradeIcon from '@/public/icons/grade.svg'
import { motion } from 'framer-motion'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6'
import { CourseInfoBox } from './CourseInfoBox'

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
      icon: assignmentIcon
    },
    {
      name: 'Grade',
      path: `/course/${courseId}/grade` as const,
      icon: gradeIcon
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
  icon: typeof assignmentIcon
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
      <Image src={item.icon} alt={item.name} width={16} height={16} />
      {isExpanded && <span className="ml-3 text-sm">{item.name}</span>}
    </Link>
  )
}
