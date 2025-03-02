'use client'

import { Separator } from '@/components/shadcn/separator'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { useSession } from '@/libs/hooks/useSession'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import codedangIcon from '@/public/logos/codedang-editor.svg'
import codedangWithTextIcon from '@/public/logos/codedang-with-text.svg'
import type { User } from '@/types/type'
import { useQuery } from '@apollo/client'
import { motion } from 'framer-motion'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState, type ComponentType } from 'react'
import type { IconType } from 'react-icons'
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
  // {
  //   name: 'Exam',
  //   path: `/admin/course/${courseId}/exam`,
  //   icon: FaFilePen
  // },
  {
    name: 'Grade',
    path: `/admin/course/${courseId}/grade`,
    icon: GradeIcon
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

function GradeIcon(props: { className: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_9941_13175)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M9.10897 1.09429C8.49034 0.495832 7.50856 0.495832 6.88994 1.09429L6.58764 1.38673C6.23388 1.72896 5.74199 1.88878 5.25464 1.81985L4.83819 1.76095C3.98594 1.6404 3.19167 2.21748 3.04295 3.06526L2.97028 3.47954C2.88524 3.96434 2.58124 4.38276 2.14645 4.61345L1.7749 4.81058C1.01457 5.214 0.711181 6.14773 1.08918 6.92101L1.2739 7.29888C1.49006 7.74108 1.49006 8.25828 1.2739 8.70048L1.08918 9.07835C0.71118 9.85163 1.01457 10.7854 1.7749 11.1888L2.14645 11.3859C2.58124 11.6166 2.88524 12.035 2.97028 12.5198L3.04295 12.9341C3.19167 13.7819 3.98594 14.359 4.83819 14.2384L5.25464 14.1795C5.74199 14.1106 6.23389 14.2704 6.58764 14.6126L6.88994 14.9051C7.50857 15.5035 8.49034 15.5035 9.10897 14.9051L9.41127 14.6126C9.76502 14.2704 10.2569 14.1106 10.7443 14.1795L11.1607 14.2384C12.013 14.359 12.8072 13.7819 12.956 12.9341L13.0286 12.5198C13.1137 12.035 13.4177 11.6166 13.8525 11.3859L14.224 11.1888C14.9843 10.7854 15.2877 9.85163 14.9097 9.07835L14.725 8.70048C14.5089 8.25828 14.5089 7.74107 14.725 7.29888L14.9097 6.92101C15.2877 6.14772 14.9843 5.214 14.224 4.81058L13.8525 4.61345C13.4177 4.38276 13.1137 3.96433 13.0286 3.47954L12.956 3.06526C12.8072 2.21748 12.013 1.6404 11.1607 1.76095L10.7443 1.81985C10.2569 1.88878 9.76502 1.72896 9.41127 1.38673L9.10897 1.09429ZM4.80594 11.3317H6.29688L6.80306 9.79471H9.21433L9.7113 11.3317H11.193L8.89221 4.66847H7.11597L4.80594 11.3317ZM8.8646 8.71792H7.15279L7.98108 6.16861H8.0271L8.8646 8.71792Z"
          className={props.className}
        />
      </g>
      <defs>
        <clipPath id="clip0_9941_13175">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
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
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.00004 8.0009C9.95516 8.0009 11.5401 6.41596 11.5401 4.46084C11.5401 2.50572 9.95516 0.920776 8.00004 0.920776C6.04491 0.920776 4.45997 2.50572 4.45997 4.46084C4.45997 6.41596 6.04491 8.0009 8.00004 8.0009ZM14.6369 13.1183C15.0523 14.1418 14.1261 15.0684 13.0215 15.0684H2.97839C1.87382 15.0684 0.94758 14.1418 1.36302 13.1183C1.40894 13.0052 1.4589 12.8931 1.51288 12.7823C1.86574 12.0575 2.38295 11.3989 3.03496 10.8442C3.68697 10.2895 4.46102 9.84944 5.31291 9.54923C6.1648 9.24901 7.07786 9.0945 7.99994 9.0945C8.92202 9.0945 9.83507 9.24901 10.687 9.54923C11.5389 9.84944 12.3129 10.2895 12.9649 10.8442C13.6169 11.3989 14.1341 12.0575 14.487 12.7823C14.541 12.8931 14.5909 13.0052 14.6369 13.1183Z"
      />
    </svg>
  )
}
