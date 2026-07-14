'use client'

import {
  DataTable,
  DataTablePagination,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { FaCheck } from 'react-icons/fa'
import type { NoticeItem } from './importNoticeTableColumns'

interface ImportNoticeTableContentProps {
  order: string
  onOrderChange: (order: string) => void
  onImportSelected: (ids: number[]) => void
  isImporting: boolean
}

export function ImportNoticeTableContent({
  order,
  onOrderChange,
  onImportSelected,
  isImporting
}: ImportNoticeTableContentProps) {
  const { table } = useDataTable<NoticeItem>()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  return (
    <>
      {/* ── 상단 컨트롤 바 ─────────────────────────────────────────
          pl-0.5  : Search 포커스 링 왼쪽 잘림 방지
          gap-2   : Search / Order / Import 간격               */}
      <div className="flex items-center gap-2 pl-0.5">
        {/* Search 입력창
            w-[480px]! : 너비 — 늘리거나 줄여서 Title 컬럼 비율 조절
            rounded-full : 모서리 스타일 */}
        <DataTableSearchBar
          columndId="title"
          size="sm"
          className="w-[480px]! rounded-full"
        />

        {/* Order 드롭다운
            h-[36px] : 버튼 높이 (Search와 맞춤)
            px-4     : 좌우 안쪽 여백 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-[36px] rounded-full px-4 text-sm font-normal"
            >
              Order
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => onOrderChange('latest')}
              className={order === 'latest' ? 'font-semibold' : ''}
            >
              Latest
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onOrderChange('oldest')}
              className={order === 'oldest' ? 'font-semibold' : ''}
            >
              Oldest
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Import 버튼 (오른쪽 끝)
            bg-[#3581FA] : 버튼 색상
            px-5         : 좌우 여백 */}
        <div className="flex-1" />
        <Button
          onClick={() =>
            onImportSelected(selectedRows.map((row) => row.original.id))
          }
          disabled={selectedRows.length === 0 || isImporting}
          className="h-[36px] rounded-full bg-[#3581FA] px-5 text-white hover:bg-[#3581FA]/90"
        >
          <FaCheck className="mr-2 h-4 w-4" />
          Import
        </Button>
      </div>

      {/* ── 테이블 본문 ────────────────────────────────────────────
          [&_tr:last-child_td]:border-0 : 마지막 행 하단 border 제거
          size="sm"       : 행 높이 (sm=40px / md=57px / lg=76px)
          isHeaderGrouped : true = 헤더 하나로 합쳐진 바 형태          */}
      <div className="[&_tr:last-child_td]:border-0">
        <DataTable
          size="sm"
          isHeaderGrouped={true}
          onRowClick={(_, row) => row.toggleSelected()}
        />
      </div>

      {/* ── 페이지네이션 ───────────────────────────────────────────
          defaultPageSize  : ImportNoticeModal의 defaultPageSize={6} 으로 제어
          showRowsPerPage  : false = "Rows per page" 셀렉트 숨김          */}
      <DataTablePagination showRowsPerPage={false} />
    </>
  )
}
