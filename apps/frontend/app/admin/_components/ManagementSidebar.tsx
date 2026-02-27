'use client'

import {
  AssignmentIcon,
  ExerciseIcon,
  HomeIcon,
  MemberIcon
} from '@/components/Icons'
import { Separator } from '@/components/shadcn/separator'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import codedangIcon from '@/public/logos/codedang-editor.svg'
import codedangWithTextIcon from '@/public/logos/codedang-with-text.svg'
import type { User } from '@/types/type'
import { useQuery } from '@apollo/client'
import { ContestRole, type UserContest } from '@generated/graphql'
import { motion } from 'framer-motion'
import type { Route } from 'next'
import type { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState, type ComponentType, type MouseEvent } from 'react'
import type { IconType } from 'react-icons'
import {
  FaAnglesLeft,
  FaAnglesRight,
  FaBell,
  FaBook,
  FaPen,
  FaSquarePollHorizontal,
  FaTrophy,
  FaUser
} from 'react-icons/fa6'
import { SideBar } from '../../../components/SideBar'

interface NavItem {
  name: string
  path: string
  icon: IconType | ComponentType<{ className: string }>
}

const getCourseNavItems = (courseId: string): NavItem[] => [
  {
    name: 'Home',
    path: `/admin/course/${courseId}` as const,
    icon: HomeIcon
  },
  // {
  //   name: 'Notice',
  //   path: `/admin/course/${courseId}/notice`,
  //   icon: FaBell
  // },
  {
    name: 'Member',
    path: `/admin/course/${courseId}/user` as const,
    icon: MemberIcon
  },
  {
    name: 'Assignment',
    path: `/admin/course/${courseId}/assignment` as const,
    icon: AssignmentIcon
  },
  {
    name: 'Exercise',
    path: `/admin/course/${courseId}/exercise` as const,
    icon: ExerciseIcon
  }
]

interface SidebarLinkProps {
  item: NavItem
  isActive: boolean
  isExpanded: boolean
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

function SidebarLink({
  item,
  isActive,
  isExpanded,
  onClick
}: SidebarLinkProps) {
  return (
    <Link
      href={item.path as Route}
      onClick={onClick}
      className={cn(
        'flex items-center px-4 py-2 transition',
        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100',
        isExpanded ? 'rounded-full' : 'rounded-xs'
      )}
    >
      <item.icon
        className={cn('h-4 w-4', isActive ? 'fill-white' : 'fill-gray-600')}
      />
      {isExpanded && <span className="text-body4_r_14 ml-3">{item.name}</span>}
    </Link>
  )
}

interface ManagementSidebarProps {
  session: Session | null
}

export function ManagementSidebar({ session }: ManagementSidebarProps) {
  const [isMainSidebarExpanded, setIsMainSidebarExpanded] = useState(true)
  const [isAnimationComplete, setIsAnimationComplete] = useState(true)
  const [isCourseSidebarOpened, setIsCourseSidebarOpened] = useState(false)
  const [isCourseSidebarExpanded, setIsCourseSidebarExpanded] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [userPermissions, setUserPermissions] = useState({
    canCreateCourse: false,
    canCreateContest: false
  })
  const [hasAnyPermissionOnContest, setHasAnyPermissionOnContest] =
    useState(false)
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

    async function fetchContestRoles() {
      try {
        const response: UserContest[] = await safeFetcherWithAuth
          .get('contest/role')
          .json()

        const hasPermission = response.some((userContest) => {
          return (
            userContest.role !== ContestRole.Participant &&
            userContest.role !== ContestRole.Reviewer
          )
        })
        setHasAnyPermissionOnContest(hasPermission)
      } catch (error) {
        console.error('Error fetching contest roles:', error)
      }
    }

    if (session) {
      fetchUserPermissions()
      fetchContestRoles()
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

    if (userPermissions.canCreateContest || hasAnyPermissionOnContest) {
      items.push({ name: 'Contest', path: '/admin/contest', icon: FaTrophy })
    }

    return items
  }

  const params = useParams()

  useEffect(() => {
    const id = (params.courseId as string) || ''
    const hasCourse = Boolean(id)

    setSelectedCourseId(id)
    setIsCourseSidebarOpened(hasCourse)

    if (hasCourse) {
      setIsMainSidebarExpanded(false)
    }
  }, [params.courseId])

  const courseItems =
    coursesData?.getCoursesUserLead.map((course) => ({
      id: course.id,
      code: `${course?.courseInfo?.courseNum}-${course?.courseInfo?.classNum}`,
      name: course.groupName
    })) || []

  const selectedCourse = courseItems.find(
    (course) => course.id.toString() === selectedCourseId
  )

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

        <div
          className={cn(
            'mb-6 mt-20 px-4',
            isMainSidebarExpanded || 'flex justify-center'
          )}
        >
          {isMainSidebarExpanded ? (
            <Link href="/">
              <Image src={codedangWithTextIcon} alt="코드당" />
            </Link>
          ) : (
            <Link href="/" className="h-5 w-10">
              <Image src={codedangIcon} alt="코드당" className="max-w-[30px]" />
            </Link>
          )}
        </div>
        <Separator className="mb-4" />

        <div className="flex flex-col gap-2">
          {getFilteredMainNavItems().map((item) => (
            <div key={item.name}>
              <SidebarLink
                item={item}
                isActive={
                  item.name === 'Dashboard'
                    ? pathname === item.path
                    : pathname.startsWith(item.path)
                }
                isExpanded={isMainSidebarExpanded}
                onClick={(e) => {
                  const isCourseItem = item.path === '/admin/course'
                  const isOnCourseDetail =
                    pathname.startsWith('/admin/course/') &&
                    isCourseSidebarOpened

                  if (isCourseItem && isOnCourseDetail) {
                    if (!isMainSidebarExpanded) {
                      setIsMainSidebarExpanded(true)
                    }
                    e.preventDefault()
                    return
                  }

                  if (!isMainSidebarExpanded) {
                    setIsMainSidebarExpanded(true)
                  }

                  if (!isCourseItem) {
                    setIsCourseSidebarOpened(false)
                  }
                }}
              />
              {item.path === '/admin/course' &&
                pathname.startsWith('/admin/course') && (
                  <div
                    className={cn(
                      'mt-4 flex flex-col gap-3 pl-4',
                      isMainSidebarExpanded && isAnimationComplete
                        ? ''
                        : 'hidden'
                    )}
                  >
                    {courseItems.map((course) => (
                      <Link
                        key={course.id}
                        href={`/admin/course/${course.id}`}
                        onClick={() => setIsCourseSidebarOpened(true)}
                        className={cn(
                          'overflow-hidden text-ellipsis text-xs transition-colors',
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
          {selectedCourse && isCourseSidebarExpanded && (
            <div className="absolute mt-16 text-gray-500">
              <div className="text-sub3_sb_16 text-gray-700">
                [{selectedCourse.code}]
              </div>
              <div>{selectedCourse.name}</div>
              <div className="mt-5 w-[190px]">
                <Separator />
              </div>
            </div>
          )}

          <div className="mt-20 flex flex-col gap-2">
            <SideBar
              navItems={getCourseNavItems(selectedCourseId)}
              isSidebarExpanded={isCourseSidebarExpanded}
              defaultItem="Home"
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}
