import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Badge } from '@/components/shadcn/badge'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { SemesterSeason } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export interface DataTableCourse {
  id: number
  title: string
  professor: string | undefined
  code: string
  classNum: number
  semester: string
  studentCount: number
  visible: boolean
}

export const columns: ColumnDef<DataTableCourse>[] = [
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
        className="translate-y-[2px] bg-white"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label="Select row"
        className="translate-y-[2px] bg-white"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: () => <p className="text-left">Name</p>,
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
        {row.getValue('title')}
      </p>
    )
  },
  {
    accessorKey: 'professor',
    header: () => <p className="text-left">Professor</p>,
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
        {row.getValue('professor')}
      </p>
    )
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Course Code" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap font-medium">
        {row.getValue('code')}
      </p>
    )
  },
  {
    accessorKey: 'semester',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Semester" />
      </div>
    ),
    cell: ({ row }) => {
      const yearSeason = row.original.semester
      const season = yearSeason.split(' ')[1]
      return (
        <div>
          <Badge
            variant={season as SemesterSeason}
            className="whitespace-nowrap rounded-md px-1.5 py-1 font-normal"
          >
            {yearSeason}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: 'studentCount',
    header: 'Members',
    cell: ({ row }) => (
      <p className="whitespace-nowrapfont-medium max-w-[700px] overflow-hidden text-ellipsis">
        {row.getValue('studentCount')}
      </p>
    )
  }
]
