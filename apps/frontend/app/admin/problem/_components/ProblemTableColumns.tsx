import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Badge } from '@/components/shadcn/badge'
import { Checkbox } from '@/components/shadcn/checkbox'
import { Switch } from '@/components/shadcn/switch'
import { UPDATE_PROBLEM_VISIBLE } from '@/graphql/problem/mutations'
import { dateFormatter } from '@/libs/utils'
import type { Level } from '@/types/type'
import { useMutation } from '@apollo/client'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { FaFileCircleExclamation } from 'react-icons/fa6'
import { ContainedContests } from './ContainedContests'
import { UseInfoModal } from './UseInfoModal'

interface Tag {
  id: number
  name: string
}

export interface DataTableProblem {
  id: number
  title: string
  updateTime: string
  difficulty: string
  submissionCount: number
  acceptedRate: number
  isVisible: boolean | null
  languages: string[]
  tag: { id: number; tag: Tag }[]
}

function VisibleCell({ row }: { row: Row<DataTableProblem> }) {
  const [updateVisible] = useMutation(UPDATE_PROBLEM_VISIBLE)

  return (
    <div className="ml-8 flex items-center space-x-2">
      <Switch
        id="hidden-mode"
        onClick={(e) => e.stopPropagation()}
        disabled={row.original.isVisible === null}
        checked={row.original.isVisible === true}
        onCheckedChange={() => {
          row.original.isVisible = !row.original.isVisible
          updateVisible({
            variables: {
              input: {
                id: row.original.id,
                isVisible: row.original.isVisible
              }
            }
          })
        }}
      />
      <ContainedContests problemId={row.original.id} />
    </div>
  )
}

export const columns: ColumnDef<DataTableProblem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
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
        <div className="w-[400px] flex-col overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
          {row.getValue('title')}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false
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
            className="flex h-[24px] w-[70px] items-center justify-center whitespace-nowrap rounded-full text-xs font-normal"
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
    accessorKey: 'updateTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Update Time" />
    ),
    cell: ({ row }) => {
      return (
        <div>
          {dateFormatter(row.original.updateTime, 'YYYY-MM-DD HH:mm:ss')}
        </div>
      )
    }
  },
  {
    accessorKey: 'isVisible',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Use Info" />
    ),
    cell: ({ row }) => {
      const problemId = row.original.id
      return <UseInfoModal problemId={problemId} />
    }
  },
  {
    accessorKey: 'isVisible',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Public" />
    ),
    cell: ({ row }) => {
      return <VisibleCell row={row} />
    }
  }
]
