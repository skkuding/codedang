'use client'

import { cn } from '@/libs/utils'
import type { CourseRecentUpdate, RecentUpdateType } from '@/types/type'
// import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { AssignmentIcon, ExamIcon, GradeIcon, QnaIcon } from './UpdateIcon'

export function RecentUpdate() {
  // const searchParams = useSearchParams()
  // const courseId = searchParams.get('courseId')
  const [updates, setUpdates] = useState<CourseRecentUpdate[]>([])

  useEffect(() => {
    const fetchUpdates = () => {
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
        setUpdates([
          {
            id: 999,
            title: 'Week 2 Assignment Uploaded',
            isNew: true,
            type: 'Assignment'
          },
          {
            id: 998,
            title: 'Week 1 Assignment Graded',
            isNew: false,
            type: 'Grade'
          },
          {
            id: 997,
            title: 'New Answer Registered',
            isNew: false,
            type: 'QnA'
          }
        ])
      } catch (err) {
        toast.error(`Failed to fetch updates: ${err}`)
      }
    }

    fetchUpdates()
  }, [])

  return (
    <div className="shadow-xs w-full rounded-xl p-4">
      <div className="mb-2 flex justify-between">
        <div>
          <span className="text-primary mr-4 font-semibold">RECENT UPDATE</span>
          <span className="text-sm font-semibold">{updates.length}</span>
        </div>
      </div>

      <ul className="space-y-5 pt-3">
        {updates.length > 0 ? (
          updates.map((update) => (
            //TODO: 업데이트 요소 누르면 해당 페이지로 넘어가는 기능 필요!
            <li
              key={update.id}
              className="flex justify-between border-b text-sm"
            >
              <div>
                <span
                  className={cn(
                    'mr-1 text-xs',
                    update.isNew ? 'text-primary' : 'text-[#8A8A8A]'
                  )}
                >
                  ●
                </span>
                <div className="mr-2 inline-block h-5 w-5">
                  <RecentUpdateIcon type={update.type} isNew={update.isNew} />
                </div>
                <span
                  className={cn(
                    'mr-2 text-xs',
                    update.isNew ? 'text-black' : 'text-[#8A8A8A]'
                  )}
                >
                  {update.title}
                </span>
              </div>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-500">공지사항이 없습니다.</p>
        )}
      </ul>
    </div>
  )
}

interface RecentUpdateIconProps {
  type: RecentUpdateType
  isNew: boolean
}

function RecentUpdateIcon({ type, isNew }: RecentUpdateIconProps) {
  const strokeColor = isNew ? 'black' : '#8A8A8A'
  switch (type) {
    case 'Assignment':
      return <AssignmentIcon strokeColor={strokeColor} />
    case 'Grade':
      return <GradeIcon strokeColor={strokeColor} />
    case 'QnA':
      return <QnaIcon strokeColor={strokeColor} />
    case 'Exam':
      return <ExamIcon strokeColor={strokeColor} />
    default:
      throw new Error(`Unknown type: ${type}`)
  }
}
