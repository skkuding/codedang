import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Badge } from '@/components/shadcn/badge'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { SemesterSeason } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

interface DataTableGroup {
  id: number
  groupName: string
  description: string
}

export const columns: ColumnDef<DataTableGroup>[] = [
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
    accessorKey: 'groupName',
    header: () => <p className="text-left">Name</p>,
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
        {row.getValue('groupName')}
      </p>
    )
  },
  {
    accessorKey: 'courseNum',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Course Num" />
      </div>
    ),
    cell: () => <p className="text-center">DAS0000_00</p>
  },
  {
    accessorKey: 'semester',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Semester" />
      </div>
    ),
    cell: () => {
      const yearSeason = '2025 Spring'
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
    accessorKey: 'members',
    header: 'Members',
    cell: () => <div>49</div>
  }
]
