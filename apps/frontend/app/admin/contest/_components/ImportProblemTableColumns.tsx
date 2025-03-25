import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Badge } from '@/components/shadcn/badge'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'

export interface DataTableProblem {
  id: number
  title: string
  updateTime: string
  difficulty: string
  submissionCount: number
  acceptedRate: number
  languages: string[]
  createdBy: string
  score?: number
  order?: number
}

export const DEFAULT_PAGE_SIZE = 5
export const MAX_SELECTED_ROW_COUNT = 20
export const ERROR_MESSAGE = `You can only import up to ${MAX_SELECTED_ROW_COUNT} problems in a contest`
export const columns: ColumnDef<DataTableProblem>[] = [
  {
    accessorKey: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={() => {
          const currentPageNotSelectedCount = table
            .getRowModel()
            .rows.filter((row) => !row.getIsSelected()).length
          const selectedRowCount = table.getSelectedRowModel().rows.length

          if (
            selectedRowCount + currentPageNotSelectedCount <=
            MAX_SELECTED_ROW_COUNT
          ) {
            table.toggleAllPageRowsSelected()
            table.setSorting([{ id: 'select', desc: true }]) // NOTE: force to trigger sortingFn
          } else {
            toast.error(ERROR_MESSAGE)
          }
        }}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    sortingFn: (rowA, rowB) => {
      const aSelected = rowA.getIsSelected()
      const bSelected = rowB.getIsSelected()

      if (aSelected === bSelected) {
        return 0
      }
      return aSelected ? 1 : -1
    },
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        className="text-center"
        column={column}
        title="Title"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-[150px] flex-col overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
          {row.getValue('title')}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false
  },
  // NOTE: accessorKey를 'languages'로 하면 languages column이 table에 추가가 안됨
  // 그래서 accessorKey를 'lang'로 변경(임의)
  {
    accessorKey: 'lang',
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          column={column}
          title="Language"
          className="text-center"
        />
      )
    },
    cell: ({ row }) => {
      const languages: string[] = row.getValue('languages') || []
      return <div className="text-primary">{languages.join(', ')}</div>
    },
    enableSorting: false
  },
  // NOTE: filter 기능을 위해서 추가
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
        title="Date"
        className="justify-center"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-neutral-500">
          {row.original.updateTime.substring(0, 10)}
        </div>
      )
    }
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Creator"
        className="justify-center"
      />
    ),
    cell: ({ row }) => {
      return <div className="text-neutral-500">{row.getValue('createdBy')}</div>
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
            className="w-[60px] whitespace-nowrap rounded-full py-1 font-normal"
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
  // {
  //   accessorKey: 'submissionCount',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Submission" />
  //   ),
  //   cell: ({ row }) => {
  //     return <div>{row.getValue('submissionCount')}</div>
  //   }
  // },
  // {
  //   accessorKey: 'acceptedRate',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Success Rate" />
  //   ),
  //   cell: ({ row }) => {
  //     const acceptedRate: number = row.getValue('acceptedRate')
  //     const acceptedRateFloat = (acceptedRate * 100).toFixed(2)
  //     return <div>{acceptedRateFloat}%</div>
  //   }
  // }
]
