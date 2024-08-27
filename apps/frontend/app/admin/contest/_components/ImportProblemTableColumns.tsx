import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

interface DataTableProblem {
  id: number
  title: string
  createTime: string
  difficulty: string
  submissionCount: number
  acceptedRate: number
  languages: string[]
}

export const columns: ColumnDef<DataTableProblem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-[500px] flex-col overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
          {row.getValue('title')}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'languages',
    header: () => {},
    cell: () => {},
    filterFn: (row, id, value) => {
      const languages = row.original.languages
      if (!languages?.length) {
        return false
      }

      const langValue: string[] = row.getValue(id)
      const valueArray = value as string[]
      const result = langValue.some((language) => valueArray.includes(language))
      return result
    }
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Update" />
    ),
    cell: ({ row }) => {
      const updateTime: string = row.getValue('createTime')
      return <div>{updateTime.substring(2, 10)}</div>
    }
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Level" />
    ),
    cell: ({ row }) => {
      const level: string = row.getValue('difficulty')
      const formattedLevel = `Level ${level.slice(-1)}`
      return (
        <div>
          <Badge
            variant={level as Level}
            className="mr-1 whitespace-nowrap rounded-md px-1.5 py-1 font-normal"
          >
            {formattedLevel}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'submissionCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submission" />
    ),
    cell: ({ row }) => {
      return <div>{row.getValue('submissionCount')}</div>
    }
  },
  {
    accessorKey: 'acceptedRate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Success Rate" />
    ),
    cell: ({ row }) => {
      const acceptedRate: number = row.getValue('acceptedRate')
      const acceptedRateFloat = (acceptedRate * 100).toFixed(2)
      return <div>{acceptedRateFloat}%</div>
    }
  }
]
