import { Checkbox } from '@/components/shadcn/checkbox'
import { useUserSelectionStore } from '@/stores/selectUserStore'
import type { ColumnDef } from '@tanstack/react-table'
import type { ContestProblemforStatistics, UserData } from './_libs/types/type'

export type LeaderBoardColumn = UserData

export const useLeaderBoardColumns = (
  problems: ContestProblemforStatistics
): ColumnDef<LeaderBoardColumn>[] => {
  const { toggleUser, isSelected } = useUserSelectionStore((state) => ({
    toggleUser: state.toggleUser,
    isSelected: state.isSelected
  }))
  return [
    {
      id: 'select',
      header: 'Mark',
      cell: ({ row }) => (
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          checked={isSelected(row.original.userId.toString())}
          onCheckedChange={() => toggleUser(row.original.userId.toString())}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      )
    },
    {
      accessorKey: 'rank',
      header: 'Rank',
      cell: ({ row }) => (
        <div className="text-center">{row.original.userRank}</div>
      )
    },
    {
      accessorKey: 'participants',
      header: 'Participants',
      cell: ({ row }) => <div>{row.original.userName}</div>
    },
    {
      accessorKey: 'penalty',
      header: 'Penalty',
      cell: ({ row }) => (
        <div className="text-center">{row.original.totalPenalty}</div>
      )
    },
    ...problems.contestProblem.map((problem): ColumnDef<LeaderBoardColumn> => {
      const problemId = String(problem.problemId)

      return {
        id: `problem_${problemId}`,
        header: () => <div className="text-center">{problem.problemOrder}</div>,
        cell: ({ row }) => {
          const detail = row.original.problemDetails[problemId]

          if (!detail) {
            return <div className="text-center">-</div>
          }

          const { attempts, penalty, judgeResult } = detail

          return (
            <div className="flex flex-col text-center text-sm">
              <div>{attempts} tries</div>
              {judgeResult === 'Accepted' ? (
                <div className="text-green-600">{penalty}</div>
              ) : (
                <div className="text-red-600">{judgeResult}</div>
              )}
              <div className="text-xs text-gray-500">{attempts}</div>
            </div>
          )
        }
      }
    })
  ]
}
