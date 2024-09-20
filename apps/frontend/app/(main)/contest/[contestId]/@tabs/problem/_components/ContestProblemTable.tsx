'use client'

import DataTable from '@/components/DataTable'
import { toast } from 'sonner'
import { columns, type ContestProblemRowData } from './Columns'

interface ContestProblemTableProps {
  contestId: string
  data: ContestProblemRowData[]
}

export default function ContestProblemTable({
  data,
  contestId
}: ContestProblemTableProps) {
  const getHref = (data: ContestProblemRowData) => {
    if (!isFinishedContest(data)) {
      return `/contest/${contestId}/problem/${data.id}` as const
    }
    if (data.isVisible) {
      return `/problem/${data.id}` as const
    }

    toast.warning('This Problem is Now in Invisible State')
    return undefined
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      headerStyle={{
        order: 'w-[8%]',
        title: 'text-left w-[50%]',
        submit: 'w-[11%]',
        submissionTime: 'w-[20%]',
        score: 'w-[11%]'
      }}
      getHref={getHref}
    />
  )
}

const isFinishedContest = (data: ContestProblemRowData) =>
  data.isVisible !== null
