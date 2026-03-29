'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { Checkbox } from '@/components/shadcn/checkbox'
import { Input } from '@/components/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { CLONE_COURSE_NOTICES } from '@/graphql/course/mutation'
import { safeFetcherWithAuth } from '@/libs/utils'
import { useMutation } from '@apollo/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FaCheck, FaSearch } from 'react-icons/fa'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { toast } from 'sonner'

interface ImportNoticeModalProps {
  courseId: string
}

interface NoticeItem {
  id: number
  title: string
  date: string
  course: string
  creator: string
}

interface CourseNoticeListApiItem {
  id: number
  title: string
  createTime?: string
  updateTime?: string
  createdBy: string | null
  isRead: boolean
  isFixed: boolean
}

interface CourseNoticeListResponse {
  data: CourseNoticeListApiItem[]
  total: number
}

const getOrderParam = (order: string) => {
  if (order === 'oldest') {
    return 'createTime-asc'
  }
  if (order === 'title') {
    return 'createTime-desc'
  }
  return 'createTime-desc'
}

export function ImportNoticeModal({ courseId }: ImportNoticeModalProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [order, setOrder] = useState('latest')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sourceCourseId, setSourceCourseId] = useState('')
  const itemsPerPage = 5

  const [cloneCourseNotices, { loading: isCloning }] =
    useMutation(CLONE_COURSE_NOTICES)

  const { data: noticeItems = [], isLoading } = useQuery({
    queryKey: [
      'importableCourseNotices',
      sourceCourseId,
      searchQuery,
      order,
      open
    ],
    queryFn: async () => {
      if (!sourceCourseId.trim()) {
        return []
      }

      const sourceId = Number(sourceCourseId)
      if (!Number.isFinite(sourceId)) {
        return []
      }

      const searchParams = {
        take: '100',
        search: searchQuery,
        readFilter: 'all',
        order: getOrderParam(order)
      }

      const [fixedResponse, normalResponse] = await Promise.all([
        safeFetcherWithAuth
          .get(`course/${sourceId}/notice/all`, {
            searchParams: {
              ...searchParams,
              fixed: 'true'
            }
          })
          .json<CourseNoticeListResponse>(),
        safeFetcherWithAuth
          .get(`course/${sourceId}/notice/all`, {
            searchParams: {
              ...searchParams,
              fixed: 'false'
            }
          })
          .json<CourseNoticeListResponse>()
      ])

      return [...fixedResponse.data, ...normalResponse.data].map<NoticeItem>(
        (notice) => ({
          id: notice.id,
          title: notice.title,
          date: notice.createTime ?? notice.updateTime ?? '',
          course: sourceCourseId,
          creator: notice.createdBy ?? 'Unknown'
        })
      )
    },
    enabled: open
  })

  const totalPages = Math.max(1, Math.ceil(noticeItems.length / itemsPerPage))

  const paginatedNotices = useMemo(() => {
    const sorted = [...noticeItems].sort((a, b) => {
      if (order === 'title') {
        return a.title.localeCompare(b.title)
      }

      const aTime = new Date(a.date || 0).getTime()
      const bTime = new Date(b.date || 0).getTime()

      return order === 'oldest' ? aTime - bTime : bTime - aTime
    })

    return sorted.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  }, [noticeItems, currentPage, order])

  const handleSelectNotice = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleImport = async () => {
    try {
      await cloneCourseNotices({
        variables: {
          courseNoticeIds: selectedIds,
          cloneToId: Number(courseId)
        }
      })

      toast.success('Notice imported!')
      await queryClient.invalidateQueries({
        queryKey: ['adminCourseNotices', Number(courseId)]
      })
      router.refresh()
      handleClose()
    } catch {
      toast.error('Failed to import notices.')
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSelectedIds([])
    setCurrentPage(1)
    setSourceCourseId('')
    setOpen(false)
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 10

    for (let i = 1; i <= Math.min(totalPages, maxVisiblePages); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`h-8 w-8 rounded text-sm ${
            currentPage === i
              ? 'font-semibold text-[#3581FA]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {i}
        </button>
      )
    }

    return pages
  }

  let tableBody: React.ReactNode

  if (isLoading) {
    tableBody = (
      <tr>
        <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
          Loading...
        </td>
      </tr>
    )
  } else if (paginatedNotices.length > 0) {
    tableBody = paginatedNotices.map((notice) => (
      <tr
        key={notice.id}
        className="cursor-pointer border-b last:border-b-0 hover:bg-gray-50"
        onClick={() => handleSelectNotice(notice.id)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedIds.includes(notice.id)}
              onCheckedChange={() => handleSelectNotice(notice.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm">{notice.title}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {notice.date ? notice.date.slice(0, 10) : '-'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">{notice.course}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{notice.creator}</td>
      </tr>
    ))
  } else {
    tableBody = (
      <tr>
        <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
          Enter a source course id to load notices.
        </td>
      </tr>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        className="h-[46px] w-[126px] rounded-full border border-[#3581FA] px-6 py-[10px] text-[#3581FA] hover:bg-[#3581FA]/10"
        onClick={() => setOpen(true)}
      >
        <span className="text-[18px] font-medium leading-[140%] tracking-[-0.03em]">
          + Import
        </span>
      </Button>

      <Modal
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleClose()
            return
          }
          setOpen(nextOpen)
        }}
        size="lg"
        type="custom"
        title="Import Notice"
        className="h-auto! max-h-[700px]! w-[750px]!"
      >
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-[200px]">
                <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-10 rounded-full pl-10"
                />
              </div>

              <Input
                placeholder="Source Course ID"
                value={sourceCourseId}
                onChange={(e) => {
                  setSourceCourseId(e.target.value)
                  setCurrentPage(1)
                  setSelectedIds([])
                }}
                className="h-10 w-[160px] rounded-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={order} onValueChange={setOrder}>
                <SelectTrigger className="h-10 w-[100px] rounded-lg">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Order</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleImport}
                disabled={selectedIds.length === 0 || isCloning}
                className="h-10 rounded-lg bg-[#3581FA] px-4 text-white hover:bg-[#3581FA]/90"
              >
                <FaCheck className="mr-2 h-4 w-4" />
                Import
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b text-sm text-gray-500">
                  <th className="w-[250px] px-4 py-3 text-left font-medium">
                    Title
                  </th>
                  <th className="w-[100px] px-4 py-3 text-left font-medium">
                    <div className="flex cursor-pointer items-center gap-1">
                      Date
                      <span className="text-xs">⇅</span>
                    </div>
                  </th>
                  <th className="w-[180px] px-4 py-3 text-left font-medium">
                    Course
                  </th>
                  <th className="w-[120px] px-4 py-3 text-left font-medium">
                    <div className="flex cursor-pointer items-center gap-1">
                      Creator
                      <span className="text-xs">⇅</span>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>{tableBody}</tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            >
              <IoChevronBack className="h-4 w-4" />
            </button>
            {renderPageNumbers()}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3581FA] text-white disabled:opacity-50"
            >
              <IoChevronForward className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
