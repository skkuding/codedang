'use client'

import { DataTableAdmin } from '@/components/DataTableAdmin'
import { fetcherGql } from '@/lib/utils'
import { gql } from '@apollo/client'
import { useEffect, useState } from 'react'
import { columns } from './_components/Columns'

export const dynamic = 'force-dynamic'

// TODO: gql @generated로 수정하고 useQuery 사용하기
const GET_CONTESTS = gql`
  query {
    getContests {
      id
      title
      startTime
      endTime
    }
  }
`

export interface Contest {
  id: number
  title: string
  startTime: string
  endTime: string
  participants: number
}

// TODO: participants 추가하기
export default function Page() {
  const [contests, setContests] = useState<Contest[]>([])
  useEffect(() => {
    fetcherGql(GET_CONTESTS).then((data) => {
      const transformedData = data.getContests.map((contest: Contest) => ({
        ...contest,
        id: +contest.id
      }))
      setContests(transformedData)
    })
  }, [])

  return (
    <div className="container mx-auto py-10">
      <DataTableAdmin columns={columns} data={contests} />
    </div>
  )
}
