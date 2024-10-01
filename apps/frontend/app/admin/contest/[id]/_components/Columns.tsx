'use client'

import ContainedContests from '@/app/admin/problem/_components/ContainedContests'
import OptionSelect from '@/components/OptionSelect'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import type { Level } from '@/types/type'
import { useQuery } from '@apollo/client'
import type { ColumnDef, Row } from '@tanstack/react-table'
import type { ContestProblem } from '../../utils'

function Included({ row }: { row: Row<ContestProblem> }) {
  const contestData = useQuery(GET_BELONGED_CONTESTS, {
    variables: {
      problemId: Number(row.original.id)
    }
  }).data
  return (
    <div className="flex justify-center">
      {contestData && <ContainedContests data={contestData} />}
    </div>
  )
}

export const columns = (
  problems: ContestProblem[],
  setProblems: React.Dispatch<React.SetStateAction<ContestProblem[]>>
): ColumnDef<ContestProblem>[] => [
  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && 'indeterminate')
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px] bg-white"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       onClick={(e) => e.stopPropagation()}
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px] bg-white"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false
  // },
  {
    accessorKey: 'title',
    header: () => <p className="w-[350px] text-left text-sm">Title</p>,
    cell: ({ row }) => (
      <p className="w-[350px] overflow-hidden text-ellipsis whitespace-nowrap text-left">
        {row.getValue('title')}
      </p>
    ),
    footer: () => <p className="w-[350px] text-left text-sm">Score Sum</p>,
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'score',
    header: () => <p className="text-center text-sm">Score</p>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Input
          defaultValue={row.getValue('score')}
          className="hide-spin-button w-[70px] focus-visible:ring-0"
          type="number"
          min={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const target = e.target as HTMLInputElement
              target.blur()
            }
          }}
          onBlur={(event) => {
            setProblems((prevProblems: ContestProblem[]) =>
              prevProblems.map((problem) =>
                problem.id === row.original.id
                  ? { ...problem, score: Number(event.target.value) }
                  : problem
              )
            )
          }}
        />
      </div>
    ),
    footer: () => (
      <div className="flex justify-center">
        <Input
          disabled={true}
          className="w-[70px] focus-visible:ring-0"
          defaultValue={problems.reduce(
            (total, problem) => total + problem.score,
            0
          )}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'order',
    header: () => <p className="text-center text-sm">Order</p>,
    cell: ({ table, row }) => {
      const tableRows = table.getRowModel().rows
      const alphabetArray = tableRows.map((_, index) =>
        String.fromCharCode(65 + index)
      )
      return (
        <div className="flex justify-center">
          <OptionSelect
            value={
              row.original.order !== undefined
                ? String.fromCharCode(Number(65 + row.original.order))
                : String.fromCharCode(Number(65 + row.index))
            }
            options={alphabetArray}
            onChange={(selectedOrder) => {
              setProblems((prevProblems: ContestProblem[]) =>
                prevProblems.map((problem) =>
                  problem.id === row.original.id
                    ? { ...problem, order: selectedOrder.charCodeAt(0) - 65 }
                    : problem
                )
              )
            }}
            className="w-[70px]"
          />
        </div>
      )
    }
  },
  {
    accessorKey: 'difficulty',
    header: () => <p className="text-center text-sm">Level</p>,
    cell: ({ row }) => {
      const level: string = row.getValue('difficulty')
      const formattedLevel = `Level ${level.slice(-1)}`
      return (
        <div>
          <Badge
            variant={level as Level}
            className="whitespace-nowrap rounded-md px-1.5 py-1 font-normal"
          >
            {formattedLevel}
          </Badge>
        </div>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'included',
    header: () => <p className="text-center text-sm">Included</p>,
    cell: ({ row }) => <Included row={row} />,
    enableSorting: false
  }
]
