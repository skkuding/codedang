'use client'

import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/libs/utils'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { BiSolidCommentEdit } from 'react-icons/bi'
import {
  FaChartBar,
  FaPen,
  FaBook,
  FaBell,
  FaAnglesLeft
} from 'react-icons/fa6'
import { IoMdPeople, IoMdChatboxes, IoMdClose } from 'react-icons/io'
import { IoHomeSharp } from 'react-icons/io5'
import { MdAssignment, MdEditDocument } from 'react-icons/md'

export function ManagementSidebar() {
  const [isCourseListOpened, setIsCourseListOpened] = useState(false)
  const [isCourseSidebarOpened, setIsCourseSidebarOpened] = useState(false)
  const [isMainSidebarExpanded] = useState(true)
  const [isCourseSidebarExpanded, setIsCourseSidebarExpanded] = useState(true)

  const pathname = usePathname()

  const mainNavItems = [
    { name: 'Dashboard', path: '/admin' as const, icon: FaChartBar },
    { name: 'My Problems', path: '/admin/problem' as const, icon: FaPen },
    { name: 'My Courses', path: '/admin/course' as const, icon: FaBook }
  ]

  const courseNavItems = [
    { name: 'Home', path: '/admin/course' as const, icon: IoHomeSharp },
    { name: 'Notice', path: '/admin/course/notice' as const, icon: FaBell },
    { name: 'User', path: '/admin/course/user' as const, icon: IoMdPeople },
    {
      name: 'Assignment',
      path: '/admin/course/assignment' as const,
      icon: MdAssignment
    },
    { name: 'Exam', path: '/admin/course/exam' as const, icon: MdEditDocument },
    {
      name: 'Grade',
      path: '/admin/course/grade' as const,
      icon: BiSolidCommentEdit
    },
    { name: 'Q&A', path: '/admin/course/qna' as const, icon: IoMdChatboxes }
  ]

  const courseItems = [
    {
      path: '/admin/course/1' as const,
      code: 'SWE0000-00',
      name: '강의는열글자까지'
    },
    {
      path: '/admin/course/2' as const,
      code: 'SWE1001-01',
      name: '소프트웨어공학'
    },
    {
      path: '/admin/course/3' as const,
      code: 'CSE2002-02',
      name: '자료구조와알고리즘'
    },
    { path: '/admin/course/4' as const, code: 'MAT3003-03', name: '선형대수학' }
  ]

  // setIsMainSidebarExpanded(true)
  return (
    <div className="flex gap-5 px-6">
      <div>
        {isMainSidebarExpanded && (
          <div className="relative w-[230px] pt-20">
            <IoMdClose className="absolute right-0 top-4 cursor-pointer text-2xl" />
            <Link href="/" className="ml-6">
              <Image
                src={codedangLogo}
                alt="코드당"
                width={135.252}
                height={28}
              />
            </Link>
            <Separator className="my-4 transition" />
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {mainNavItems.map((item) => (
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
                      'rounded px-4 py-2 transition',
                      (
                        item.path === '/admin'
                          ? pathname === item.path
                          : pathname.startsWith(item.path)
                      )
                        ? 'bg-primary text-white hover:opacity-95'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {item.icon && <item.icon className="mr-2 inline-block" />}
                    {item.name}
                  </Link>
                ))}
              </div>
              {isCourseListOpened && (
                <div className="flex flex-col gap-3 text-xs">
                  {courseItems.map((course) => (
                    <Link
                      key={course.name}
                      href={course.path}
                      onClick={() => {
                        setIsCourseSidebarOpened(true)
                        setIsCourseSidebarExpanded(true)
                      }}
                      className={cn(
                        pathname === course.path ? 'text-primary' : 'text-black'
                      )}
                    >
                      [{course.code}] {course.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isCourseSidebarOpened && (
        <motion.div
          initial={{ x: -260 }}
          animate={{ x: isCourseSidebarOpened ? 0 : -260 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="relative flex flex-col gap-2"
        >
          <FaAnglesLeft
            className="absolute right-0 top-4 cursor-pointer text-xl"
            onClick={() => setIsCourseSidebarExpanded(false)}
          />
          <div className="flex h-screen flex-col gap-2 pt-20">
            {courseNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  'flex items-center rounded px-4 py-2 transition',
                  (
                    item.path === '/admin/course'
                      ? pathname === item.path
                      : pathname.startsWith(item.path)
                  )
                    ? 'bg-primary text-white hover:opacity-95'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {item.icon && <item.icon className="mr-2" />}
                <span
                  className={cn(
                    'overflow-hidden transition-all',
                    isCourseSidebarExpanded
                      ? 'w-auto opacity-100'
                      : 'w-0 opacity-0'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
