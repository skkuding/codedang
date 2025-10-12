import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { TOGGLE_CONTEST_QNA_RESOLVED } from '@/graphql/contest/mutations'
import { dateFormatter } from '@/libs/utils'
import { useMutation } from '@apollo/client'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { toast } from 'sonner'
import { useQnaCommentsSync } from './context/RefetchingQnaStoreProvider'

export interface DataTableQna {
  id: number
  order: number
  title: string
  createTime: string
  category: string
  isResolved: boolean
  isRead: boolean
  contestId: number
  problemId?: number | null
  createdBy?: { username: string } | null
  _count: { comments: number }
}

interface CreatedByType {
  username: string
}

interface ContestProblem {
  problemId: number
  order: number
  problem: {
    title: string
  }
}

function AnsweredCell({ row }: { row: Row<DataTableQna> }) {
  const [toggleResolved] = useMutation(TOGGLE_CONTEST_QNA_RESOLVED)
  const triggerRefresh = useQnaCommentsSync((s) => s.triggerRefresh)
  return (
    <div className="flex items-center">
      <button
        className={`${
          row.original.isResolved
            ? 'bg-color-neutral-99 border-color-neutral-90 text-color-neutral-70 border'
            : 'text-primary border-primary border'
        } h-9 w-[102px] rounded-full px-3 py-1 text-sm font-medium transition hover:opacity-80`}
        onClick={async (e) => {
          e.stopPropagation()
          try {
            await toggleResolved({
              variables: {
                contestId: Number(row.original.contestId),
                qnAOrder: Number(row.original.order)
              }
            })
          } catch (error) {
            if (error instanceof Error) {
              toast.error(error.message)
            }
          } finally {
            triggerRefresh()
          }
        }}
      >
        {row.original.isResolved ? 'Answered' : 'Unanswer'}
      </button>
    </div>
  )
}

export const createColumns = (
  contestProblems: ContestProblem[]
): ColumnDef<DataTableQna>[] => [
  {
    accessorKey: 'order',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No" />
    ),
    cell: ({ row }) => {
      return <p className="text-base">{row.getValue('order')}</p>
    }
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
        className="w-[178px]"
      />
    ),
    cell: ({ row }) => {
      const qna = row.original
      const matchedProblem = contestProblems.find(
        (problem) => problem.problemId === qna.problemId
      )
      const categoryName = matchedProblem
        ? `${String.fromCharCode(65 + matchedProblem.order)}. ${matchedProblem.problem.title}`
        : 'General'

      return (
        <p className="max-w-[178px] truncate text-base text-[#808080]">
          {categoryName}
        </p>
      )
    }
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Question"
        className="w-[400px] text-base"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="truncate text-base">
          {row.getValue('title')}
          {!row.original.isRead && (
            <span className="bg-primary ml-2 inline-block h-2 w-2 rounded-full" />
          )}
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
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Writer"
        className="text-base"
      />
    ),
    cell: ({ row }) => {
      const createdBy: CreatedByType = row.getValue('createdBy')
      return <p className="text-base text-[#808080]">{createdBy.username}</p>
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return (
        <p className="text-base text-[#808080]">
          {dateFormatter(row.getValue('createTime'), 'YYYY-MM-DD HH:mm:ss')}
        </p>
      )
    }
  },
  {
    accessorKey: 'Answer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Answer" />
    ),
    cell: ({ row }) => {
      return <AnsweredCell row={row} />
    }
  }
]
