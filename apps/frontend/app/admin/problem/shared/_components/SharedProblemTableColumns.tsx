import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Badge } from '@/components/shadcn/badge'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

interface Tag {
  id: number
  name: string
}

export interface SharedDataTableProblem {
  id: number
  title: string
  updateTime: string
  difficulty: string
  languages: string[]
  tag: { id: number; tag: Tag }[]
}

export const columns: ColumnDef<SharedDataTableProblem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        aria-label="Select all"
        className="translate-y-[2px]"
        disabled={true}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        className="translate-y-[2px]"
        disabled={true}
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
        <div className="w-[400px] flex-col overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
          {row.getValue('title')}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false
  },
  /**
   * @description
   * made this column for filtering languages
   * doesn't show in datatable
   */
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
    accessorKey: 'updateTime',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Update"
        className="justify-center"
      />
    ),
    cell: ({ row }) => {
      return <div>{row.original.updateTime.substring(2, 10)}</div>
    }
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Level"
        className="justify-center"
      />
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
  }
]
