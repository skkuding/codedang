import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { UPDATE_PROBLEM_VISIBLE } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { FiEyeOff } from 'react-icons/fi'
import { FiEye } from 'react-icons/fi'

interface Tag {
  id: number
  name: string
}

interface DataTableProblem {
  id: number
  title: string
  createTime: string
  difficulty: string
  submissionCount: number
  acceptedRate: number
  isVisible: boolean
  languages: string[]
  tag: { id: number; tag: Tag }[]
}

function VisibleCell({ row }: { row: Row<DataTableProblem> }) {
  const [updateVisible] = useMutation(UPDATE_PROBLEM_VISIBLE)

  return (
    <div className="flex space-x-2">
      <Switch
        id="hidden-mode"
        checked={row.original.isVisible}
        onCheckedChange={() => {
          row.original.isVisible = !row.original.isVisible
          updateVisible({
            variables: {
              groupId: 1,
              input: {
                id: row.original.id,
                isVisible: row.original.isVisible
              }
            }
          })
        }}
      />
      <div className="flex items-center justify-center">
        {row.original.isVisible ? (
          <FiEye className="text-primary h-[14px] w-[14px]" />
        ) : (
          <FiEyeOff className="h-[14px] w-[14px] text-gray-400" />
        )}
      </div>
    </div>
  )
}

export const columns: ColumnDef<DataTableProblem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] bg-white"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] bg-white"
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
          <Badge className="mr-1 whitespace-nowrap rounded-md border-gray-400 bg-gray-300 px-1 font-normal">
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
  },
  {
    accessorKey: 'isVisible',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visible" />
    ),
    cell: ({ row }) => {
      return <VisibleCell row={row} />
    }
  }
]
