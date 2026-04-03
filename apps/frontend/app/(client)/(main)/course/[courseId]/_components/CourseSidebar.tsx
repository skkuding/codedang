'use client'

import { SideBar } from '@/components/SideBar'
import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/libs/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6'
import {
  AssignmentIcon,
  ExerciseIcon,
  QnaIcon
} from '../../../../../../components/Icons'
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
      icon: AssignmentIcon
    },
    {
      name: 'Exercise',
      path: `/course/${courseId}/exercise` as const,
      icon: ExerciseIcon
    },
    {
      name: 'Q&A',
      path: `/course/${courseId}/qna` as const,
      icon: QnaIcon
    }
  ]

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="fixed z-10 w-full border-b border-gray-200 bg-white px-4 py-3">
          <nav className="flex items-center justify-center">
            {navItems.map((item) => {
              const isActive = pathname.includes(item.path)
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={cn(
                    'relative flex-1 px-4 py-2 text-center text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <span>{item.name}</span>
                  <div
                    className={cn(
                      'absolute bottom-0 left-0 right-0 h-0.5 transition-colors',
                      isActive ? 'bg-primary' : 'bg-transparent'
                    )}
                  />
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
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
              className={cn(
                'flex flex-col gap-2',
                !isSidebarExpanded && 'mt-36'
              )}
            >
              <SideBar
                navItems={navItems}
                isSidebarExpanded={isSidebarExpanded}
              />
            </nav>
          </motion.div>
        </div>
      </div>
    </>
  )
}
