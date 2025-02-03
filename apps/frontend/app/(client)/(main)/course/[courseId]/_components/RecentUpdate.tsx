'use client'

import assignmentIcon from '@/public/icons/assignment.svg'
import examIcon from '@/public/icons/exam.svg'
import gradeIcon from '@/public/icons/grade.svg'
import QnAIcon from '@/public/icons/qna.svg'
import type { CourseRecentUpdate, RecentUpdateType } from '@/types/type'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function RecentUpdate() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  const [updates, setUpdates] = useState<CourseRecentUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const getRecentUpdateIcon = (type: RecentUpdateType) => {
    switch (type) {
      case 'Assignment':
        return '@/public/icons/assignment.svg'
      case 'Grade':
        return '@/public/icons/grade.svg'
      case 'QnA':
        return '@/public/icons/qna.svg'
      case 'Exam':
        return '@/public/icons/exam.svg'
      default:
        throw new Error(`Unknown type: ${type}`)
    }
  }

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
        setError('업데이트를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
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

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
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
                    className={`mr-2 text-xs ${
                      update.isNew ? 'text-primary' : 'text-[#8A8A8A]'
                    }`}
                  >
                    ●
                  </span>
                  {/* TODO: update.isNew일때 검정, else 회색 아직 적용 못 했습니다. svg파일에 색 적용하는 법을 모르겠어요.. */}
                  <svg
                    width="20"
                    height="20"
                    className="mb-1 mr-2 inline-block"
                    fill={update.isNew ? '#ffffff' : '#8A8A8A'}
                  >
                    <use href={getRecentUpdateIcon(update.type)} />
                  </svg>
                  <span
                    className={`mr-2 text-xs ${
                      update.isNew ? 'text-black' : 'text-[#8A8A8A]'
                    }`}
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
      )}
    </div>
  )
}
