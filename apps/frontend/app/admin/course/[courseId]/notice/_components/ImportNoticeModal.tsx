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
import { useState } from 'react'
import { FaCheck, FaSearch } from 'react-icons/fa'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'

interface ImportNoticeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
}

interface NoticeItem {
  id: number
  title: string
  date: string
  course: string
  creator: string
}

// 임시 더미 데이터
const dummyNotices: NoticeItem[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: '피보나치 함수',
  date: '2024-02-12',
  course: '[DAE2000] UXUI 디자인',
  creator: 'codedang1238'
}))

export function ImportNoticeModal({
  open,
  onOpenChange
}: ImportNoticeModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [order, setOrder] = useState('latest')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // 필터링된 공지사항
  const filteredNotices = dummyNotices.filter((notice) =>
    notice.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 페이지네이션
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage)
  const paginatedNotices = filteredNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSelectNotice = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleImport = () => {
    // TODO: API 호출
    console.log('Import notices:', selectedIds)
    onOpenChange(false)
    setSelectedIds([])
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
        {/* 검색 및 필터 영역 */}
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
                <SelectItem value="latest">Order</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleImport}
              disabled={selectedIds.length === 0}
              className="h-10 rounded-lg bg-[#3581FA] px-4 text-white hover:bg-[#3581FA]/90"
            >
              <FaCheck className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>

        {/* 테이블 */}
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
            <tbody>
              {paginatedNotices.map((notice) => (
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
                    {notice.date}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {notice.course}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {notice.creator}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
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
