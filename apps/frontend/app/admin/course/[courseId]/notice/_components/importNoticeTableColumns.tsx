import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { ColumnDef } from '@tanstack/react-table'

export interface NoticeItem {
  id: number
  title: string
  date: string
  course: string
  creator: string
}

// ── 컬럼 정의 ──────────────────────────────────────────────────────────────
// header title=""  : 컬럼 헤더에 표시되는 텍스트 → 직접 수정 가능
// max-w-[...]      : 셀 최대 너비 (좁히면 텍스트가 truncate 됨)
// enableSorting    : false = 정렬 불가 / true(기본) = 헤더 클릭으로 정렬 가능
// ───────────────────────────────────────────────────────────────────────────
export const importNoticeColumns: ColumnDef<NoticeItem>[] = [
  // 체크박스 컬럼 (너비 자동)
  {
    id: 'select',
    header: () => <div />,
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false
  },

  // Title 컬럼 — 가장 넓은 컬럼, 검색 대상
  // max-w-[240px] : 너비 조절
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[320px] truncate text-sm">
        {row.getValue('title')}
      </span>
    ),
    enableSorting: false
  },

  // Date 컬럼 — 헤더 클릭으로 오름/내림차순 정렬 가능
  // date.slice(0, 10) : "YYYY-MM-DD" 형식으로 표시
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date: string = row.getValue('date')
      return (
        <span className="text-sm text-[#52525B]">
          {date ? date.slice(0, 10) : '-'}
        </span>
      )
    }
  },

  // Course 컬럼 — Source Course ID 값이 표시됨
  // max-w-[140px] : 너비 조절
  {
    accessorKey: 'course',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[140px] truncate text-sm text-[#52525B]">
        {row.getValue('course')}
      </span>
    ),
    enableSorting: false
  },

  // Creator 컬럼 — notice.createdBy 값이 표시됨
  // max-w-[100px] : 너비 조절
  {
    accessorKey: 'creator',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creator" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[100px] truncate text-sm text-[#52525B]">
        {row.getValue('creator')}
      </span>
    )
  }
]
