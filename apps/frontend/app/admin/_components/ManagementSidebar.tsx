'use client'

import { Separator } from '@/components/shadcn/separator'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { useSession } from '@/libs/hooks/useSession'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import codedangWithTextIcon from '@/public/logos/codedang-with-text.svg'
import { User } from '@/types/type'
import { useQuery } from '@apollo/client'
import { motion } from 'framer-motion'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { IconType } from 'react-icons'
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

interface NavItem {
  name: string
  path: string
  icon: IconType
}

const getCourseNavItems = (courseId: string): NavItem[] => [
  { name: 'Home', path: `/admin/course/${courseId}`, icon: FaHome },
  // {
  //   name: 'Notice',
  //   path: `/admin/course/${courseId}/notice`,
  //   icon: FaBell
  // },
  {
    name: 'Member',
    path: `/admin/course/${courseId}/user`,
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
  {
    name: 'Grade',
    path: `/admin/course/${courseId}/grade`,
    icon: FaStar
  }
  // {
  //   name: 'Q&A',
  //   path: `/admin/course/${courseId}/qna`,
  //   icon: FaQuestion
  // }
]

function SidebarLink({
  item,
  isActive,
  isExpanded,
  onClick
}: {
  item: NavItem
  isActive: boolean
  isExpanded: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={item.path as Route}
      onClick={onClick}
      className={cn(
        'flex items-center px-4 py-2 transition',
        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100',
        isExpanded ? 'rounded-full' : 'rounded'
      )}
    >
      <item.icon className="h-4 w-4" />
      {isExpanded && <span className="ml-3 text-sm">{item.name}</span>}
    </Link>
  )
}

export function ManagementSidebar() {
  const session = useSession()
  const [isMainSidebarExpanded, setIsMainSidebarExpanded] = useState(true)
  const [isAnimationComplete, setIsAnimationComplete] = useState(true)
  const [isCourseListOpened, setIsCourseListOpened] = useState(false)
  const [isCourseSidebarOpened, setIsCourseSidebarOpened] = useState(false)
  const [isCourseSidebarExpanded, setIsCourseSidebarExpanded] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [userPermissions, setUserPermissions] = useState({
    canCreateCourse: false,
    canCreateContest: false
  })
  const pathname = usePathname()

  const { data: coursesData } = useQuery(GET_COURSES_USER_LEAD)
  const hasLeadCourses = (coursesData?.getCoursesUserLead?.length ?? 0) > 0

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const user: User = await safeFetcherWithAuth.get('user').json()
        setUserPermissions({
          canCreateCourse: user.canCreateCourse ?? false,
          canCreateContest: user.canCreateContest ?? false
        })
      } catch (error) {
        console.error('Error fetching user permissions:', error)
      }
    }

    if (session) {
      fetchUserPermissions()
    }
  }, [session])

  const getFilteredMainNavItems = () => {
    const items: NavItem[] = []
    const isAdmin = session?.user?.role !== 'User'

    if (isAdmin) {
      items.push(
        { name: 'Dashboard', path: '/admin', icon: FaSquarePollHorizontal },
        { name: 'User', path: '/admin/user', icon: FaUser },
        { name: 'Notice', path: '/admin/notice', icon: FaBell }
      )
    }
    items.push({ name: 'Problem', path: '/admin/problem', icon: FaPen })

    if (userPermissions.canCreateCourse || hasLeadCourses) {
      items.push({ name: 'Course', path: '/admin/course', icon: FaBook })
    }

    if (userPermissions.canCreateContest) {
      items.push({ name: 'Contest', path: '/admin/contest', icon: FaTrophy })
    }

    return items
  }

  const params = useParams()

  useEffect(() => {
    if (params.courseId) {
      setSelectedCourseId(params.courseId as string)
      setIsCourseSidebarOpened(true)
    }
  }, [params.courseId])

  const courseItems =
    coursesData?.getCoursesUserLead.map((course) => ({
      id: course.id,
      code: `${course?.courseInfo?.courseNum}-${course?.courseInfo?.classNum}`,
      name: course.groupName
    })) || []

  return (
    <div className="mx-6 flex h-full gap-5">
      {/* Main Sidebar */}
      <motion.div
        initial={{ width: 190 }}
        animate={{ width: isMainSidebarExpanded ? 190 : 48 }}
        className="relative flex flex-col"
        onAnimationStart={() => setIsAnimationComplete(false)}
        onAnimationComplete={() => setIsAnimationComplete(true)}
      >
        <button
          onClick={() => setIsMainSidebarExpanded(!isMainSidebarExpanded)}
          className="absolute right-2 top-4 text-gray-500 hover:text-gray-700"
        >
          {isMainSidebarExpanded ? <FaAnglesLeft /> : <FaAnglesRight />}
        </button>

        <div className="mb-6 mt-20 px-4">
          {isMainSidebarExpanded ? (
            <Link href="/">
              <Image src={codedangWithTextIcon} alt="코드당" />
            </Link>
          ) : (
            <div className="h-5" />
          )}
        </div>
        <Separator className="mb-4" />

        <div className="flex flex-col gap-2">
          {getFilteredMainNavItems().map((item) => (
            <div key={item.name}>
              <SidebarLink
                item={item}
                isActive={pathname === item.path}
                isExpanded={isMainSidebarExpanded}
                onClick={() => {
                  if (item.path === '/admin/course') {
                    setIsCourseListOpened(true)
                  } else {
                    setIsCourseSidebarOpened(false)
                    setIsCourseListOpened(false)
                  }
                }}
              />
              {item.path === '/admin/course' && isCourseListOpened && (
                <div
                  className={cn(
                    'mt-4 flex flex-col gap-3 pl-4',
                    isMainSidebarExpanded && isAnimationComplete ? '' : 'hidden'
                  )}
                >
                  {courseItems.map((course) => (
                    <Link
                      key={course.id}
                      href={`/admin/course/${course.id}`}
                      onClick={() => setIsCourseSidebarOpened(true)}
                      className={cn(
                        'overflow-hidden overflow-ellipsis text-xs transition-colors',
                        params.courseId === course.id.toString()
                          ? 'text-primary'
                          : 'hover:text-primary text-gray-600'
                      )}
                    >
                      [{course.code}] {course.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Course Sidebar */}
      {isCourseSidebarOpened && (
        <motion.div
          initial={{ width: 190 }}
          animate={{ width: isCourseSidebarExpanded ? 190 : 48 }}
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
              <SidebarLink
                key={item.name}
                item={item}
                isActive={pathname === item.path}
                isExpanded={isCourseSidebarExpanded}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
