'use client'

import { Button } from '@/components/shadcn/button'
import { Separator } from '@/components/shadcn/separator'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { cn } from '@/libs/utils'
import codedangWithTextIcon from '@/public/logos/codedang-with-text.svg'
import { useQuery } from '@apollo/client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  FaSquarePollHorizontal,
  FaUser,
  FaBell,
  FaPen,
  FaBook,
  FaTrophy,
  FaAnglesLeft,
  FaAnglesRight
} from 'react-icons/fa6'
import {
  MdHome,
  MdPeople,
  MdAssignment,
  MdEditDocument,
  MdGrade,
  MdQuestionAnswer
} from 'react-icons/md'

export function ManagementSidebar() {
  const [isMainSidebarExpanded, setIsMainSidebarExpanded] = useState(true)
  const [isCourseListOpened, setIsCourseListOpened] = useState(false)
  const [isCourseSidebarOpened, setIsCourseSidebarOpened] = useState(false)
  const [isCourseSidebarExpanded, setIsCourseSidebarExpanded] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const pathname = usePathname()

  const mainNavItems = [
    { name: 'Dashboard', path: '/admin', icon: FaSquarePollHorizontal },
    { name: 'User', path: '/admin/user', icon: FaUser },
    { name: 'Notice', path: '/admin/notice', icon: FaBell },
    { name: 'Problem', path: '/admin/problem', icon: FaPen },
    { name: 'Course', path: '/admin/course', icon: FaBook },
    { name: 'Contest', path: '/admin/contest', icon: FaTrophy }
  ]

  const getCourseNavItems = (courseId: string) => [
    { name: 'Home', path: `/admin/course/${courseId}`, icon: MdHome },
    { name: 'Notice', path: `/admin/course/${courseId}/notice`, icon: FaBell },
    {
      name: 'Member',
      path: `/admin/course/${courseId}/member`,
      icon: MdPeople
    },
    {
      name: 'Assignment',
      path: `/admin/course/${courseId}/assignment`,
      icon: MdAssignment
    },
    {
      name: 'Exam',
      path: `/admin/course/${courseId}/exam`,
      icon: MdEditDocument
    },
    { name: 'Grade', path: `/admin/course/${courseId}/grade`, icon: MdGrade },
    {
      name: 'Q&A',
      path: `/admin/course/${courseId}/qna`,
      icon: MdQuestionAnswer
    }
  ]

  function extractCourseId(pathname: string) {
    const match = pathname.match(/\/admin\/course\/(\d+)/)
    return match?.[1] || ''
  }

  useEffect(() => {
    const courseId = extractCourseId(pathname)
    if (courseId) {
      setSelectedCourseId(courseId)
      setIsCourseSidebarOpened(true)
    }
  }, [pathname])

  const { data: coursesData } = useQuery(GET_COURSES_USER_LEAD)

  const courseItems =
    coursesData?.getCoursesUserLead.map((course) => ({
      id: course.id,
      code: `${course?.courseInfo?.courseNum}-${course?.courseInfo?.classNum}`,
      name: course.groupName
    })) || []

  const courseList = (
    <div className="mt-2 flex flex-col gap-2 pl-8">
      {courseItems.map((course) => (
        <Link
          key={course.id}
          href={`/admin/course/${course.id}`}
          onClick={() => setIsCourseSidebarOpened(true)}
          className={cn(
            'overflow-hidden overflow-ellipsis text-sm transition-colors',
            pathname.match(/\/admin\/course\/(\d+)/)?.[1] ===
              course.id.toString()
              ? 'text-primary font-medium'
              : 'hover:text-primary text-gray-600'
          )}
        >
          [{course.code}] {course.name}
        </Link>
      ))}
    </div>
  )

  return (
    <div className="flex gap-5">
      <motion.div
        initial={{ width: 230 }}
        animate={{ width: isMainSidebarExpanded ? 230 : 60 }}
        className="relative flex flex-col border-r border-gray-200 px-2"
      >
        {/* Main Sidebar Toggle Button */}
        <button
          onClick={() => setIsMainSidebarExpanded(!isMainSidebarExpanded)}
          className="absolute right-2 top-4 text-gray-500 hover:text-gray-700"
        >
          {isMainSidebarExpanded ? <FaAnglesLeft /> : <FaAnglesRight />}
        </button>

        <div className="mb-6 mt-4 pl-2">
          {isMainSidebarExpanded ? (
            <Image
              src={codedangWithTextIcon}
              alt="코드당"
              width={135}
              height={28}
            />
          ) : null}
        </div>
        <Separator className="mb-4" />

        {/* Main Navigation Items */}
        <div className="flex flex-col gap-2">
          {mainNavItems.map((item) => (
            <div key={item.name}>
              <Link
                key={item.name}
                href={item.path}
                onClick={() => {
                  if (item.path === '/admin/course') {
                    setIsCourseListOpened(true)
                  } else {
                    setIsCourseSidebarOpened(false)
                    setIsCourseListOpened(false)
                  }
                }}
                className={cn(
                  'flex items-center rounded px-3 py-2 transition',
                  pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5" />
                {isMainSidebarExpanded && (
                  <span className="ml-3 transition-all">{item.name}</span>
                )}
              </Link>
              {item.path === '/admin/course' &&
                isCourseListOpened &&
                courseList}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Course Sidebar */}
      {isCourseSidebarOpened && (
        <motion.div
          initial={{ width: 230 }}
          animate={{ width: isCourseSidebarExpanded ? 230 : 60 }}
          className="relative flex flex-col border-r border-gray-200 px-2"
        >
          <button
            onClick={() => setIsCourseSidebarExpanded(!isCourseSidebarExpanded)}
            className="absolute right-2 top-4 text-gray-500 hover:text-gray-700"
          >
            {isCourseSidebarExpanded ? <FaAnglesLeft /> : <FaAnglesRight />}
          </button>

          <div className="mt-16 flex flex-col gap-2">
            {getCourseNavItems(selectedCourseId).map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  'flex items-center rounded px-3 py-2 transition',
                  pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5" />
                {isCourseSidebarExpanded && (
                  <span className="ml-3 transition-all">{item.name}</span>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
