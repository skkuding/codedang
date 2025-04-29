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
import {
  AssignmentIcon
  // ExamIcon,
  // HomeIcon,
  // MemberIcon,
  // NoticeIcon,
  // QnaIcon
} from './Icons'

interface CourseSidebarProps {
  courseId: string
}

export function CourseSidebar({ courseId }: CourseSidebarProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  const pathname = usePathname()

  const navItems = [
    // {
    //   name: 'Home',
    //   path: `/course/${courseId}` as const,
    //   icon: <HomeIcon fill={getActiveColor(pathname, `/course/${courseId}`)} />
    // },
    // {
    //   name: 'Notice',
    //   path: `/course/${courseId}/notice` as const,
    //   icon: (
    //     <NoticeIcon
    //       fill={getActiveColor(pathname, `/course/${courseId}/notice`)}
    //     />
    //   )
    // },
    // {
    //   name: 'Member',
    //   path: `/course/${courseId}/member` as const,
    //   icon: (
    //     <MemberIcon
    //       fill={getActiveColor(pathname, `/course/${courseId}/member`)}
    //     />
    //   )
    // },
    {
      name: 'Assignment',
      path: `/course/${courseId}/assignment` as const,
      icon: (
        <AssignmentIcon
          fill={getActiveColor(pathname, `/course/${courseId}/assignment`)}
        />
      )
    },
    // TODO: Exercise ICON 확정되면 변경할 것
    {
      name: 'Exercise',
      path: `/course/${courseId}/exercise` as const,
      icon: (
        <AssignmentIcon
          fill={getActiveColor(pathname, `/course/${courseId}/exercise`)}
        />
      )
    }
    // {
    //   name: 'Exam',
    //   path: `/course/${courseId}/exam` as const,
    //   icon: (
    //     <ExamIcon fill={getActiveColor(pathname, `/course/${courseId}/exam`)} />
    //   )
    // },
    // {
    //   name: 'Grade',
    //   path: `/course/${courseId}/grade` as const,
    //   icon: (
    //     <GradeIcon
    //       fill={getActiveColor(pathname, `/course/${courseId}/grade`)}
    //     />
    //   )
    // }
    // {
    //   name: 'Q&A',
    //   path: `/course/${courseId}/qna` as const,
    //   icon: (
    //     <QnaIcon fill={getActiveColor(pathname, `/course/${courseId}/qna`)} />
    //   )
    // }
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
              isActive={pathname.startsWith(item.path)}
              isExpanded={isSidebarExpanded}
            />
          ))}
        </nav>
      </motion.div>
    </div>
  )
}

function getActiveColor(pathname: string, path: string) {
  return pathname.startsWith(path) ? 'white' : '#8A8A8A'
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
        isActive ? 'bg-primary text-white' : 'text-[#474747] hover:bg-gray-100',
        isExpanded ? 'w-48 rounded-full' : 'rounded'
      )}
    >
      {item.icon}
      {isExpanded && (
        <span className="ml-3 text-base font-medium">{item.name}</span>
      )}
    </Link>
  )
}
