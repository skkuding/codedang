'use client'

import { cn } from '@/libs/utils'
import assignmentIcon from '@/public/icons/assignment.svg'
import examIcon from '@/public/icons/exam.svg'
import homeIcon from '@/public/icons/home.svg'
import noticeIcon from '@/public/icons/notice.svg'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function Sidebar() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')

  const navItems: { name: string; path: Route; icon: string }[] = [
    { name: 'Home', path: `/course/${courseId}` as const, icon: homeIcon },
    {
      name: 'Notice',
      path: `/course/${courseId}/notice` as const,
      icon: noticeIcon
    },
    {
      name: 'Exam',
      path: `/course/${courseId}/exam` as const,
      icon: examIcon
    },
    {
      name: 'Assignment',
      path: `/course/${courseId}/assignment` as const,
      icon: assignmentIcon
    },
    {
      name: 'Grade',
      path: `/course/${courseId}/grade` as const,
      icon: assignmentIcon
    },
    {
      name: 'Q&A',
      path: `/course/${courseId}/qna` as const,
      icon: assignmentIcon
    }
  ]

  return (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.path}
          className="rounded px-4 py-2 transition"
        >
          <Image
            src={item.icon}
            alt={item.name}
            width={24}
            height={24}
            className="mr-2 inline-block"
          />
          <span className="font-pretendard text-[1rem] font-bold leading-[1rem] text-[#21272A]">
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  )
}
