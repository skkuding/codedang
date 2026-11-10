import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import { cn } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import type { DataTableCourse } from './Columns'

export interface CourseTableRow {
  id: number
  type: 'master' | 'section'
  title: string
  code: string
  classNum: number | null
  semester: string
  studentCount: number | null
  subRows?: CourseTableRow[]
}

export const coursesMockData: CourseTableRow[] = [
  {
    id: 1,
    type: 'master',
    title: '전자회로1',
    code: 'CHS1330',
    classNum: null,
    semester: '2026 Winter',
    studentCount: null,
    subRows: [
      {
        id: 11,
        type: 'section',
        title: '전자회로1',
        code: 'CHS1330',
        classNum: 43,
        semester: '2026 Winter',
        studentCount: 12
      },
      {
        id: 12,
        type: 'section',
        title: '전자회로1',
        code: 'CHS1330',
        classNum: 42,
        semester: '2026 Winter',
        studentCount: 41
      }
    ]
  },
  {
    id: 2,
    type: 'master',
    title: '김민규개론',
    code: 'SWE1234',
    classNum: null,
    semester: '2026 Winter',
    studentCount: null,
    subRows: [
      {
        id: 21,
        type: 'section',
        title: '김민규개론',
        code: 'SWE1234',
        classNum: 15,
        semester: '2026 Winter',
        studentCount: 15
      },
      {
        id: 22,
        type: 'section',
        title: '김민규개론',
        code: 'SWE1234',
        classNum: 16,
        semester: '2026 Winter',
        studentCount: 33
      }
    ]
  }
]

export const mockColumns: ColumnDef<CourseTableRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(Boolean(value))
        }
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label="Select row"
        className="translate-y-[2px] bg-transparent"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.getCanExpand() && (
          <button
            type="button"
            onClick={row.getToggleExpandedHandler()}
            aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
          >
            {row.getIsExpanded() ? '⌄' : '›'}
          </button>
        )}
        {row.original.type === 'section'
          ? `${row.original.code}-${row.original.classNum}`
          : row.original.code}
      </div>
    )
  },
  {
    accessorKey: 'classNum',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Section" />
    ),
    cell: ({ row }) =>
      row.original.type === 'master' ? 'Master' : row.original.classNum,
    enableSorting: false
  },
  {
    accessorKey: 'semester',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Semester" />
    ),
    cell: ({ row }) => {
      const yearSeason = row.original.semester

      return (
        <div
          className={cn(
            'border-primary text-primary flex h-[30px] w-[116px] items-center justify-center rounded-full border'
          )}
        >
          <p className="text-body2_m_14">{yearSeason}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Title"
        className="w-[300px]"
      />
    ),
    cell: ({ row }) => (
      <div className="flex w-full justify-center">{row.original.title}</div>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'studentCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
    cell: ({ row }) =>
      row.original.type === 'master' ? '-' : row.original.studentCount,
    enableSorting: false
  }
]
