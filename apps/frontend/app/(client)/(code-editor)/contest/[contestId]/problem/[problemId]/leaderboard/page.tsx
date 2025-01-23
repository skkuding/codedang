'use client'

import Paginator from '@/components/Paginator'
import { usePagination } from '@/libs/hooks/usePagination'
import type { LeaderboardItem } from '@/types/type'
import { columns } from './_components/Columns'
import DataTable from './_components/DataTable'

// import dummyData from './temp_data.json'

export default function Leaderboard({
  params
}: {
  params: { problemId: string; contestId: string }
}) {
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
          rank: 'w-[23%]',
          username: 'w-[27%]',
          penalty: 'w-[27%]',
          solved: 'w-[23%]'
        }}
        problemId={Number(problemId)}
        contestId={Number(contestId)}
      />
      <Paginator page={paginator.page} slot={paginator.slot} />
    </>
  )
}
