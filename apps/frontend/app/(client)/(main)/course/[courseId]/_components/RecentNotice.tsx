'use client'

import { cn } from '@/libs/utils'
import type { CourseNotice } from '@/types/type'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}.${month}.${day}`
}

interface DateBadgeProps {
  date: string
}

function DateBadge({ date }: DateBadgeProps) {
  return (
    <div className="text-primary mb-1 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
      <span>{date}</span>
    </div>
  )
}

export function RecentNotice() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  const [notices, setNotices] = useState<CourseNotice[]>([])

  useEffect(() => {
    const fetchNotices = () => {
      try {
        // TODO: API 연동 시 사용할 코드입니다.
        // const response = await fetch('')
        // if (!response.ok) {
        //   throw new Error('Failed to fetch notices')
        // }
        // const data = await response.json()

        // const formattedData = data.map((item: Notice) => ({
        //   id: item.id,
        //   text: item.title,
        //   isNew: item.isNew ?? false
        // }))

        // setNotices(formattedData)

        // 이것은 샘플 데이터입니다.
        setNotices([
          {
            id: 999,
            title: '[필독] 3주차 과제 1번 문제 수정사항',
            isNew: true,
            date: new Date(2025, 1, 27)
          },
          {
            id: 998,
            title: '[필독] 확인된 공지명은 이렇게 보이는 식',
            isNew: false,
            date: new Date(2025, 1, 27)
          },
          {
            id: 997,
            title: '[샘플] 공지 테스트 3',
            isNew: false,
            date: new Date(2025, 1, 27)
          }
        ])
      } catch (err) {
        toast.error(`Failed to fetch notices: ${err}`)
      }
    }

    fetchNotices()
  }, [])

  return (
    <div className="shadow-xs w-full rounded-xl p-4">
      <div className="mb-2 flex justify-between">
        <div>
          <span className="text-primary text-sub3_sb_16 mr-4">
            Recent Notice
          </span>
          <span className="text-sub4_sb_14">{notices.length}</span>
        </div>

        <Link
          href={`/course/${courseId}/notice` as const}
          className="text-primary flex items-center text-xs font-semibold"
        >
          SHOW MORE<span className="ml-1">+</span>
        </Link>
      </div>
      <ul className="space-y-5 pt-3">
        {notices.length > 0 ? (
          notices.map((notice) => (
            //TODO: 공지 요소 누르면 해당 페이지로 넘어가는 기능 필요!
            <li
              key={notice.id}
              className="text-body4_r_14 flex justify-between border-b"
            >
              <div>
                <span
                  className={cn(
                    'mr-2 text-xs',
                    notice.isNew ? 'text-primary' : 'text-[#8A8A8A]'
                  )}
                >
                  ●
                </span>
                <span
                  className={cn(
                    'mr-2 text-xs',
                    notice.isNew ? 'text-black' : 'text-[#8A8A8A]'
                  )}
                >
                  {notice.title}
                </span>
              </div>
              <DateBadge date={formatDate(notice.date)} />
            </li>
          ))
        ) : (
          <p className="text-body4_r_14 text-gray-500">공지사항이 없습니다.</p>
        )}
      </ul>
    </div>
  )
}
