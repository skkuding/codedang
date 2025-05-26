'use client'

import { Separator } from '@/components/shadcn/separator'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { useSession } from '@/libs/hooks/useSession'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import codedangIcon from '@/public/logos/codedang-editor.svg'
import codedangWithTextIcon from '@/public/logos/codedang-with-text.svg'
import type { User } from '@/types/type'
import { useQuery } from '@apollo/client'
import { ContestRole, type UserContest } from '@generated/graphql'
import { motion } from 'framer-motion'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState, type ComponentType } from 'react'
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

interface NavItem {
  name: string
  path: string
  icon: IconType | ComponentType<{ className: string }>
}

const getCourseNavItems = (courseId: string): NavItem[] => [
  {
    name: 'Home',
    path: `/admin/course/${courseId}`,
    icon: HomeIcon
  },
  // {
  //   name: 'Notice',
  //   path: `/admin/course/${courseId}/notice`,
  //   icon: FaBell
  // },
  {
    name: 'Member',
    path: `/admin/course/${courseId}/user`,
    icon: MemberIcon
  },
  {
    name: 'Assignment',
    path: `/admin/course/${courseId}/assignment`,
    icon: AssignmentIcon
  },
  {
    name: 'Exercise',
    path: `/admin/course/${courseId}/exercise`,
    icon: ExerciseIcon
  }
  // {
  //   name: 'Exam',
  //   path: `/admin/course/${courseId}/exam`,
  //   icon: FaFilePen
  // },

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
      <item.icon
        className={cn('h-4 w-4', isActive ? 'fill-white' : 'fill-gray-600')}
      />
      {isExpanded && <span className="ml-3 text-sm">{item.name}</span>}
    </Link>
  )
}

export function ManagementSidebar() {
  const session = useSession()
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
                onClick={() => {
                  if (item.path !== '/admin/course') {
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
                isActive={
                  item.name === 'Home'
                    ? pathname === item.path
                    : pathname.startsWith(item.path)
                }
                isExpanded={isCourseSidebarExpanded}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function AssignmentIcon(props: { className: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1.15332 3.05131C1.15332 2.14126 1.89322 1.40137 2.80327 1.40137H6.92813V4.70126C6.92813 5.15757 7.29679 5.52623 7.7531 5.52623H11.053V9.12517L8.61159 11.5666C8.40019 11.778 8.25066 12.0435 8.17848 12.3323L7.79177 13.8817C7.73248 14.124 7.74537 14.3715 7.82786 14.5984H2.80327C1.89322 14.5984 1.15332 13.8585 1.15332 12.9484V3.05131ZM11.053 4.70126H7.7531V1.40137L11.053 4.70126ZM15.3274 7.47781L15.6986 7.84904C16.1008 8.25122 16.1008 8.90346 15.6986 9.30821L14.9407 10.0662L13.1103 8.23575L13.8682 7.47781C14.2704 7.07563 14.9226 7.07563 15.3274 7.47781ZM9.19423 12.1518L12.5251 8.82096L14.3555 10.6514L11.0246 13.9796C10.9189 14.0853 10.7875 14.1601 10.6405 14.1962L9.0911 14.5829C8.94931 14.619 8.80236 14.5777 8.69924 14.4746C8.59612 14.3715 8.55487 14.2245 8.59096 14.0827L8.97767 12.5333C9.01376 12.389 9.08853 12.2549 9.19423 12.1492V12.1518Z" />
    </svg>
  )
}

function ExerciseIcon(props: { className: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.05713 4.41833C2.05713 3.58991 2.7287 2.91833 3.55713 2.91833H12.4423C13.2707 2.91833 13.9423 3.58991 13.9423 4.41833V8.84998C13.9423 9.6784 13.2707 10.35 12.4423 10.35H3.55713C2.7287 10.35 2.05713 9.6784 2.05713 8.84998V4.41833ZM6.37192 6.63562L7.0923 5.91523V5.91291C7.31074 5.69679 7.30842 5.34357 7.0923 5.12513C6.87619 4.90669 6.52297 4.90669 6.30453 5.12513L5.1891 6.24057C4.97066 6.45668 4.97066 6.8099 5.1891 7.02834L6.30453 8.14377C6.52065 8.36221 6.87387 8.35989 7.0923 8.14377C7.31074 7.92766 7.31074 7.57444 7.0923 7.356L6.37192 6.63562ZM10.8104 6.24057L9.69498 5.12513V5.12746C9.47887 4.90902 9.12565 4.91134 8.90721 5.12746C8.68877 5.34357 8.68877 5.69679 8.90721 5.91523L9.62759 6.63562L8.90721 7.356C8.68877 7.57211 8.69109 7.92533 8.90721 8.14377C9.12332 8.36221 9.47654 8.36221 9.69498 8.14377L10.8104 7.02834C11.0289 6.81222 11.0289 6.459 10.8104 6.24057ZM1.00965 11.098C0.763325 11.098 0.563477 11.2979 0.563477 11.5442C0.563477 12.5295 1.36287 13.0816 2.34817 13.0816H13.6512C14.6365 13.0816 15.4359 12.5295 15.4359 11.5442C15.4359 11.2979 15.2361 11.098 14.9897 11.098H1.00965Z"
      />
    </svg>
  )
}

function HomeIcon(props: { className: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15.0045 7.98783C15.0045 8.42587 14.6395 8.769 14.2258 8.769H13.447L13.4641 12.6675C13.4641 12.7332 13.4592 12.7989 13.4519 12.8646V13.2564C13.4519 13.7943 13.0163 14.2299 12.4785 14.2299H12.0891C12.0624 14.2299 12.0356 14.2299 12.0088 14.2274C11.9747 14.2299 11.9407 14.2299 11.9066 14.2299H11.1157H10.5317C9.99385 14.2299 9.55824 13.7943 9.55824 13.2564V12.6724V11.1149C9.55824 10.6842 9.21025 10.3362 8.77951 10.3362H7.22205C6.79131 10.3362 6.44331 10.6842 6.44331 11.1149V12.6724V13.2564C6.44331 13.7943 6.00771 14.2299 5.4699 14.2299H4.88585H4.10955C4.07305 14.2299 4.03654 14.2274 4.00004 14.225C3.97084 14.2274 3.94164 14.2299 3.91243 14.2299H3.52307C2.98526 14.2299 2.54965 13.7943 2.54965 13.2564V10.5309C2.54965 10.509 2.54965 10.4846 2.55209 10.4627V8.769H1.77092C1.33288 8.769 0.992188 8.4283 0.992188 7.98783C0.992188 7.76881 1.06519 7.57413 1.23554 7.40378L7.47513 1.96482C7.64548 1.79448 7.84017 1.77014 8.01051 1.77014C8.18086 1.77014 8.37554 1.81881 8.52156 1.94049L14.7368 7.40378C14.9315 7.57413 15.0288 7.76881 15.0045 7.98783Z" />
    </svg>
  )
}

function MemberIcon(props: { className: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.00004 8.0009C9.95516 8.0009 11.5401 6.41596 11.5401 4.46084C11.5401 2.50572 9.95516 0.920776 8.00004 0.920776C6.04491 0.920776 4.45997 2.50572 4.45997 4.46084C4.45997 6.41596 6.04491 8.0009 8.00004 8.0009ZM14.6369 13.1183C15.0523 14.1418 14.1261 15.0684 13.0215 15.0684H2.97839C1.87382 15.0684 0.94758 14.1418 1.36302 13.1183C1.40894 13.0052 1.4589 12.8931 1.51288 12.7823C1.86574 12.0575 2.38295 11.3989 3.03496 10.8442C3.68697 10.2895 4.46102 9.84944 5.31291 9.54923C6.1648 9.24901 7.07786 9.0945 7.99994 9.0945C8.92202 9.0945 9.83507 9.24901 10.687 9.54923C11.5389 9.84944 12.3129 10.2895 12.9649 10.8442C13.6169 11.3989 14.1341 12.0575 14.487 12.7823C14.541 12.8931 14.5909 13.0052 14.6369 13.1183Z"
      />
    </svg>
  )
}
