'use client'

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
import { FaHome, FaQuestion, FaStar } from 'react-icons/fa'
import {
  FaSquarePollHorizontal,
  FaUser,
  FaBell,
  FaPen,
  FaBook,
  FaTrophy,
  FaAnglesLeft,
  FaAnglesRight,
  FaFilePen
} from 'react-icons/fa6'

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
    { name: 'Home', path: `/admin/course/${courseId}`, icon: FaHome },
    // { name: 'Notice', path: `/admin/course/${courseId}/notice`, icon: FaBell },
    {
      name: 'Member',
      path: `/admin/course/${courseId}/member`,
      icon: FaUser
    },
    {
      name: 'Assignment',
      path: `/admin/course/${courseId}/assignment`,
      icon: FaFilePen
    },
    // {
    //   name: 'Exam',
    //   path: `/admin/course/${courseId}/exam`,
    //   icon: FaFilePen
    // },
    { name: 'Grade', path: `/admin/course/${courseId}/grade`, icon: FaStar }
    // {
    //   name: 'Q&A',
    //   path: `/admin/course/${courseId}/qna`,
    //   icon: FaQuestion
    // }
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
    <div className="mt-2 flex flex-col gap-2 pl-4">
      {courseItems.map((course) => (
        <Link
          key={course.id}
          href={`/admin/course/${course.id}`}
          onClick={() => setIsCourseSidebarOpened(true)}
          className={cn(
            'overflow-hidden overflow-ellipsis text-xs transition-colors',
            pathname.match(/\/admin\/course\/(\d+)/)?.[1] ===
              course.id.toString()
              ? 'text-primary'
              : 'hover:text-primary text-gray-600'
          )}
        >
          [{course.code}] {course.name}
        </Link>
      ))}
    </div>
  )

  return (
    <div className="mx-6 flex h-full gap-5">
      <motion.div
        initial={{ width: 190 }}
        animate={{ width: isMainSidebarExpanded ? 190 : 32 }}
        className="relative flex flex-col"
      >
        {/* Main Sidebar Toggle Button */}
        <button
          onClick={() => setIsMainSidebarExpanded(!isMainSidebarExpanded)}
          className="absolute right-2 top-4 text-gray-500 hover:text-gray-700"
        >
          {isMainSidebarExpanded ? <FaAnglesLeft /> : <FaAnglesRight />}
        </button>

        <div className="mb-6 mt-20 px-4">
          {isMainSidebarExpanded ? (
            <Image src={codedangWithTextIcon} alt="코드당" />
          ) : (
            <div className="h-5" />
          )}
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
                  'flex items-center rounded px-2 py-2 transition',
                  pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-4 w-4" />
                {isMainSidebarExpanded && (
                  <span className="ml-3 text-sm transition-all">
                    {item.name}
                  </span>
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
          initial={{ width: 144 }}
          animate={{ width: isCourseSidebarExpanded ? 144 : 44 }}
          className="relative flex flex-col"
        >
          <button
            onClick={() => setIsCourseSidebarExpanded(!isCourseSidebarExpanded)}
            className="absolute right-2 top-4 text-gray-500 hover:text-gray-700"
          >
            {isCourseSidebarExpanded ? <FaAnglesLeft /> : <FaAnglesRight />}
          </button>
          <div className="h-[3.8rem]" />
          <div className="mt-20 flex flex-col gap-2">
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
                <item.icon className="h-4 w-4" />
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
