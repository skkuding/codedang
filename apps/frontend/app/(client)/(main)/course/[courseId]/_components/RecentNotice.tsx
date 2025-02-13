'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Notice {
  id: number
  title: string
  isNew: boolean
}

export function RecentNotice() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
            isNew: true
          },
          {
            id: 998,
            title: '[필독] 확인된 공지명은 이렇게 보이는 식',
            isNew: false
          },
          { id: 997, title: '[샘플] 공지 테스트 3', isNew: false }
        ])
      } catch (err) {
        setError('공지사항을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
  }, [])

  return (
    <div className="w-full rounded-xl border border-gray-300 p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-gray-800">최근 공지</span>
        <Link
          href={`/course/${courseId}/notice` as const}
          className="flex items-center text-sm text-gray-500"
        >
          show more <span className="ml-1">+</span>
        </Link>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <ul className="space-y-5 pt-3">
          {notices.length > 0 ? (
            notices.map((notice) => (
              //TODO: 공지 요소 누르면 해당 페이지로 넘어가는 기능 필요!
              <li
                key={notice.id}
                className="flex border-b pb-1 text-sm text-gray-700"
              >
                <span
                  className={`mr-2 text-xs ${
                    notice.isNew ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  ●
                </span>
                <span className={notice.isNew ? 'font-bold' : ''}>
                  {notice.title}
                </span>
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
