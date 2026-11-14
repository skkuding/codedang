import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import { cn } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { CourseTableRow } from './section_mock'

// export interface DataTableCourse {
//   id: number
//   title: string
//   code: string
//   classNum: number | null
//   semester: string
//   studentCount: number
// }

// export const columns: ColumnDef<DataTableCourse>[] = [
//   {
//     id: 'select',
//     header: ({ table }) => (
//       <Checkbox
//         onClick={(e) => e.stopPropagation()}
//         checked={table.getIsAllPageRowsSelected()}
//         onCheckedChange={(value) =>
//           table.toggleAllPageRowsSelected(Boolean(value))
//         }
//         aria-label="Select all"
//         className="translate-y-[2px]"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         onClick={(e) => e.stopPropagation()}
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
//         aria-label="Select row"
//         className="translate-y-[2px] bg-transparent"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false
//   },
//   {
//     accessorKey: 'code',
//     header: ({ column }) => (
//       <DataTableColumnHeader column={column} title="Code" />
//     ),
//     cell: ({ row }) => row.getValue('code')
//   },
//   {
//     accessorKey: 'classNum',
//     header: ({ column }) => (
//       <DataTableColumnHeader column={column} title="Section" />
//     ),
//     cell: ({ row }) => row.getValue('classNum') ?? '-',
//     enableSorting: false
//   },

//   {
//     accessorKey: 'semester',
//     header: ({ column }) => (
//       <DataTableColumnHeader column={column} title="Semester" />
//     ),
//     cell: ({ row }) => {
//       const yearSeason = row.original.semester
//       return (
//         <div
//           className={cn(
//             'border-primary text-primary flex h-[30px] w-[116px] items-center justify-center rounded-full border'
//           )}
//         >
//           <p className="text-body2_m_14">{yearSeason}</p>
//         </div>
//       )
//     }
//   },
//   {
//     accessorKey: 'title',
//     header: ({ column }) => (
//       <DataTableColumnHeader
//         column={column}
//         title="Title"
//         className="w-[300px]"
//       />
//     ),
//     cell: ({ row }) => {
//       return (
//         <div className="flex w-full justify-center">
//           {row.getValue('title')}
//         </div>
//       )
//     },
//     enableSorting: false
//   },
//   {
//     accessorKey: 'studentCount',
//     header: ({ column }) => (
//       <DataTableColumnHeader column={column} title="Members" />
//     ),
//     cell: ({ row }) => row.getValue('studentCount'),
//     enableSorting: false
//   }
// ]

export const columns: ColumnDef<CourseTableRow>[] = [
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
      <div className="text-body2_m_14 flex items-center justify-start gap-[32px]">
        <div className="flex size-4 shrink-0 items-center justify-start">
          {row.getCanExpand() && (
            <button
              type="button"
              className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-neutral-200/60"
              onClick={(e) => {
                e.stopPropagation()
                row.toggleExpanded()
              }}
              aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="size-5" />
              ) : (
                <ChevronRight className="size-5" />
              )}
            </button>
          )}
        </div>

        {row.original.code}
      </div>
    )
  },
  {
    accessorKey: 'classNum',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Section" />
    ),
    cell: ({ row }) =>
      row.original.type === 'master' ? (
        <div className="bg-primary rounded-full px-4 py-[6px] text-white">
          Master
        </div>
      ) : (
        row.original.classNum
      ),
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
    },
    filterFn: (row, columnId, filterValues: string[]) => {
      return filterValues.includes(row.getValue(columnId))
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
