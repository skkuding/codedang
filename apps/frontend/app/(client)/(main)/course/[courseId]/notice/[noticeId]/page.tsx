'use client'

import { getNotices } from '@/libs/noticeStore'
import { dateFormatter } from '@/libs/utils'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaUser } from 'react-icons/fa6'
import { IoTime } from 'react-icons/io5'

export default function NoticeDetail() {
  const { courseId, noticeId } = useParams()
  const currentId = Number(noticeId)

  const [allNotices, setAllNotices] = useState(getNotices())

  useEffect(() => {
    setAllNotices(getNotices())
  }, [])

  const sorted = [...allNotices].sort((a, b) => b.id - a.id)
  const currentIndex = sorted.findIndex((n) => n.id === currentId)
  const notice = sorted[currentIndex]
  const prevNotice =
    currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null
  const nextNotice = currentIndex > 0 ? sorted[currentIndex - 1] : null

  const displayNo = notice ? sorted.length - currentIndex : 0

  const basePath = `/course/${courseId}/notice`

  if (!notice) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Notice not found.
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col px-4 pb-12 pt-10 lg:mt-20 lg:px-6 lg:pt-0">
      {/* No. Label */}
      <div className="mb-5">
        <span className="inline-block rounded-full bg-[#F5F5F5] px-4 py-1.5 text-sm text-[#787E80]">
          No. {displayNo}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-xl font-semibold leading-snug text-[#333333] lg:text-2xl">
        {notice.title}
      </h1>

      {/* Author & Date (two lines) */}
      <div className="mt-4 flex flex-col gap-1.5 text-sm text-[#787E80]">
        <div className="flex items-center gap-2">
          <FaUser className="h-3.5 w-3.5 text-[#3581FA]" />
          <span>{notice.createdBy}</span>
        </div>
        <div className="flex items-center gap-2">
          <IoTime className="h-4 w-4 text-[#3581FA]" />
          <span>{dateFormatter(notice.createTime, 'YYYY-MM-DD HH:mm:ss')}</span>
        </div>
      </div>

      {/* Content */}
      <div
        className="prose mt-8 max-w-full text-sm leading-relaxed text-gray-800 lg:text-base"
        dangerouslySetInnerHTML={{ __html: notice.content }}
      />

      {/* Previous / Next Navigation */}
      <div className="mt-12 overflow-hidden rounded-lg border border-[#E5E5E5]">
        {prevNotice && (
          <Link
            href={`/course/${courseId}/notice/${prevNotice.id}`}
            className="flex items-center border-b border-[#E5E5E5] px-6 py-4 hover:bg-gray-50"
          >
            <span className="w-24 text-sm font-semibold text-gray-700">
              Previous
            </span>
            <span className="text-sm text-gray-600">{prevNotice.title}</span>
          </Link>
        )}
        {nextNotice && (
          <Link
            href={`/course/${courseId}/notice/${nextNotice.id}`}
            className="flex items-center px-6 py-4 hover:bg-gray-50"
          >
            <span className="w-24 text-sm font-semibold text-[#3581FA]">
              Next
            </span>
            <span className="text-sm text-gray-600">{nextNotice.title}</span>
          </Link>
        )}
      </div>

      {/* Back to the List */}
      <div className="mt-4 flex justify-end">
        <Link
          href={basePath}
          className="rounded-full border border-[#D9D9D9] px-5 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Back to the List
        </Link>
      </div>

      {/* Comments Section */}
      <div className="mt-12">
        <h2 className="text-[24px] font-medium leading-[130%] tracking-[-0.03em]">
          COMMENTS <span className="text-[#3581FA]">0</span>
        </h2>
        <div className="mt-4 flex flex-col items-center justify-center rounded-lg bg-[#F5F5F5] py-12 text-[#B0B0B0]">
          <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#D9D9D9] text-xs text-white">
            !
          </div>
          <span className="text-sm">Comments not registered</span>
        </div>
      </div>
    </div>
  )
}
