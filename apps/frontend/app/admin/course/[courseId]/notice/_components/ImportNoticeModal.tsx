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
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { safeFetcherWithAuth } from '@/libs/utils'
import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { FaCheck, FaSearch } from 'react-icons/fa'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { toast } from 'sonner'

interface ImportNoticeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  onSuccess?: () => void
}

interface LeadCourseItem {
  id: string
  groupName: string
}

interface NoticeItem {
  id: number
  title: string
  date: string
  course: string
  creator: string
}

interface CourseNoticeListResponse {
  data: Array<{
    id: number
    title: string
    updateTime: string
    createdBy: string | null
  }>
  total: number
}

export function ImportNoticeModal({
  open,
  onOpenChange,
  courseId,
  onSuccess
}: ImportNoticeModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [order, setOrder] = useState('latest')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [allNotices, setAllNotices] = useState<NoticeItem[]>([])
  const [isLoadingNotices, setIsLoadingNotices] = useState(false)

  const itemsPerPage = 5

  const { data: coursesData } = useQuery(GET_COURSES_USER_LEAD, {
    skip: !open
  })

  const [cloneCourseNotices, { loading: isImporting }] =
    useMutation(CLONE_COURSE_NOTICES)

  useEffect(() => {
    const loadImportableNotices = async () => {
      if (!open) {
        return
      }

      const leadCourses: LeadCourseItem[] = (
        coursesData?.getCoursesUserLead ?? []
      ).filter((course) => course.id !== courseId)

      if (leadCourses.length === 0) {
        setAllNotices([])
        return
      }

      try {
        setIsLoadingNotices(true)

        const results = await Promise.all(
          leadCourses.flatMap((course) => [
            safeFetcherWithAuth
              .get(`course/${course.id}/notice/all`, {
                searchParams: {
                  take: '100',
                  fixed: 'false',
                  readFilter: 'all',
                  order: 'createTime-desc'
                }
              })
              .json<CourseNoticeListResponse>()
              .then((res) =>
                res.data.map((notice) => ({
                  id: notice.id,
                  title: notice.title,
                  date: notice.updateTime,
                  course: course.groupName,
                  creator: notice.createdBy ?? 'Unknown'
                }))
              ),
            safeFetcherWithAuth
              .get(`course/${course.id}/notice/all`, {
                searchParams: {
                  take: '100',
                  fixed: 'true',
                  readFilter: 'all',
                  order: 'createTime-desc'
                }
              })
              .json<CourseNoticeListResponse>()
              .then((res) =>
                res.data.map((notice) => ({
                  id: notice.id,
                  title: notice.title,
                  date: notice.updateTime,
                  course: course.groupName,
                  creator: notice.createdBy ?? 'Unknown'
                }))
              )
          ])
        )

        setAllNotices(results.flat())
      } catch {
        toast.error('Failed to load importable notices.')
        setAllNotices([])
      } finally {
        setIsLoadingNotices(false)
      }
    }

    loadImportableNotices()
  }, [open, coursesData, courseId])

  const filteredNotices = useMemo(() => {
    const filtered = allNotices.filter((notice) =>
      notice.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (order === 'oldest') {
      return [...filtered].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    }

    if (order === 'title') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    }

    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [allNotices, searchQuery, order])

  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage) || 1
  const paginatedNotices = filteredNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSelectNotice = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
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
      onSuccess?.()
      handleClose()
    } catch {
      toast.error('Failed to import notices.')
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSelectedIds([])
    setCurrentPage(1)
    onOpenChange(false)
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

  const renderTableBody = () => {
    if (isLoadingNotices) {
      return (
        <tr>
          <td
            colSpan={4}
            className="px-4 py-6 text-center text-sm text-gray-500"
          >
            Loading...
          </td>
        </tr>
      )
    }

    if (paginatedNotices.length === 0) {
      return (
        <tr>
          <td
            colSpan={4}
            className="px-4 py-6 text-center text-sm text-gray-500"
          >
            No notices found.
          </td>
        </tr>
      )
    }

    return paginatedNotices.map((notice) => (
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
          {notice.date.slice(0, 10)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">{notice.course}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{notice.creator}</td>
      </tr>
    ))
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      size="lg"
      type="custom"
      title="Import Notice"
      className="h-auto! max-h-[700px]! w-[750px]!"
    >
      <div className="flex flex-col gap-4 pt-4">
        <div className="flex items-center justify-between">
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

          <div className="flex items-center gap-2">
            <Select value={order} onValueChange={setOrder}>
              <SelectTrigger className="h-10 w-[100px] rounded-lg">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleImport}
              disabled={selectedIds.length === 0 || isImporting}
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
                  <div className="flex items-center gap-1">
                    Date
                    <span className="text-xs">⇅</span>
                  </div>
                </th>
                <th className="w-[180px] px-4 py-3 text-left font-medium">
                  Course
                </th>
                <th className="w-[120px] px-4 py-3 text-left font-medium">
                  <div className="flex items-center gap-1">
                    Creator
                    <span className="text-xs">⇅</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>{renderTableBody()}</tbody>
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
      </div>
    </Modal>
  )
}
