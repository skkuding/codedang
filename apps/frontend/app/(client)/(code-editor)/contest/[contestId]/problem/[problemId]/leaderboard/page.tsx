'use client'

import { Paginator } from '@/components/Paginator'
import { usePagination } from '@/libs/hooks/usePagination'
import type { LeaderboardItem } from '@/types/type'
import { columns } from './_components/Columns'
import { DataTable } from './_components/DataTable'

// import dummyData from './temp_data.json'

interface Params {
  problemId: string
  contestId: string
}

export default function Leaderboard({ params }: { params: Params }) {
  const { problemId, contestId } = params

  // TODO: 백엔드의 api가 완성되면 api 경로를 리더보드 정보 가져오는 것으로 변경해줘야 함. -bang
  const { items, paginator } = usePagination<LeaderboardItem>(
    `contest/${contestId}/submission?problemId=${problemId}`,
    17,
    5,
    true
  )

  return (
    <>
      <DataTable
        data={items ?? []}
        columns={columns}
        headerStyle={{
          rank: 'w-[20%]',
          username: 'w-[29%]',
          penalty: 'w-[30%]',
          solved: 'w-[21%]'
        }}
        problemId={Number(problemId)}
        contestId={Number(contestId)}
      />
      <Paginator page={paginator.page} slot={paginator.slot} />
    </>
  )
}
