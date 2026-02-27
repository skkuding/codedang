import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import { cn } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'

export interface DataTableCourse {
  id: number
  title: string
  code: string
  semester: string
  studentCount: number
}

export const getColumns = (
  t: (key: string) => string
): ColumnDef<DataTableCourse>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(Boolean(value))
        }
        aria-label={t('select_all')}
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label={t('select_row')}
        className="translate-y-[2px] bg-transparent"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('title')}
        className="w-[400px]"
      />
    ),
    cell: ({ row }) => {
      return row.getValue('title')
    },
    enableSorting: false
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('code')} />
    ),
    cell: ({ row }) => row.getValue('code')
  },
  {
    accessorKey: 'semester',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('semester')} />
    ),
    cell: ({ row }) => {
      const yearSeason = row.original.semester
      return (
        <div
          className={cn(
            'border-primary text-primary flex h-[30px] w-[116px] items-center justify-center rounded-full border'
          )}
        >
          <p className="text-sm font-medium">{yearSeason}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'studentCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('members')} />
    ),
    cell: ({ row }) => row.getValue('studentCount'),
    enableSorting: false
  }
]
