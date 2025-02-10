'use client'

import { cn } from '@/libs/utils'
import assignmentIcon from '@/public/icons/assignment.svg'
import examIcon from '@/public/icons/exam.svg'
import gradeIcon from '@/public/icons/grade.svg'
import qnaIcon from '@/public/icons/qna.svg'
import type { CourseRecentUpdate, RecentUpdateType } from '@/types/type'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function RecentUpdate() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
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
    <div className="w-full rounded-xl p-4 shadow">
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
                    'mr-2 text-xs',
                    update.isNew ? 'text-primary' : 'text-[#8A8A8A]'
                  )}
                >
                  ●
                </span>
                {/* <RecentUpdateIcon type={update.type} isNew={update.isNew} /> */}

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

// function RecentUpdateIcon({ type, isNew }: RecentUpdateIconProps) {
//   let icon

//   switch (type) {
//     case 'Assignment':
//       icon = AssignmentIcon
//       break
//     case 'Grade':
//       icon = gradeIcon
//       break
//     case 'QnA':
//       icon = qnaIcon
//       break
//     case 'Exam':
//       icon = examIcon
//       break
//     default:
//       throw new Error(`Unknown type: ${type}`)
//   }

//   return (
//     <svg
//       width={17}
//       height={17}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={isNew ? 'currentColor' : '#8A8A8A'}
//       strokeWidth={2}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className={cn(
//         'inline-block',
//         isNew ? 'stroke-primary' : 'stroke-[#8A8A8A]'
//       )}
//     >
//       {icon}
//     </svg>
//   )
// }
