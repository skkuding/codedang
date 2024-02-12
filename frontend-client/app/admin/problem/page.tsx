import { DataTableAdmin } from '@/components/DataTableAdmin'
import { fetcher } from '@/lib/utils'
import { Problem } from '@/types/type'
import * as React from 'react'
import { columns } from './_components/Columns'

export const dynamic = 'force-dynamic'

// 우선 Codedang Client API에서 데이터 가져옴 -> 나중에 Codedang Admin에서 가져오도록 수정

export default async function Page() {
  // 현재 이부분에서 tags data를 가져오지 못함
  const data: { problems: Problem[] } = await fetcher
    .get('problem', {
      searchParams: {
        take: 10,
        contestId: 1
      }
    })
    .json()

  const problems: Problem[] = data.problems

  return (
    <div className="container mx-auto py-10">
      <DataTableAdmin columns={columns} data={problems} />
    </div>
  )
}
