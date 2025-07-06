'use client'

import { SideBar } from '@/app/admin/_components/SideBar'
import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/libs/utils'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6'
import {
  AssignmentIcon,
  ExerciseIcon
} from '../../../../../../components/Icons'
import { CourseInfoBox } from './CourseInfoBox'

interface CourseSidebarProps {
  courseId: string
}

export function CourseSidebar({ courseId }: CourseSidebarProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  const navItems = [
    {
      name: 'Assignment',
      path: `/course/${courseId}/assignment` as const,
      icon: AssignmentIcon
    },
    {
      name: 'Exercise',
      path: `/course/${courseId}/exercise` as const,
      icon: ExerciseIcon
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
          <SideBar navItems={navItems} isSidebarExpanded={isSidebarExpanded} />
        </nav>
      </motion.div>
    </div>
  )
}
