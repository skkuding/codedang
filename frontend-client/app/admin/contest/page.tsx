'use client'

import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Button } from '@/components/ui/button'
import { fetcherGql } from '@/lib/utils'
import { gql } from '@apollo/client'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
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
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <div>
          <p className="text-4xl font-bold">Contest List</p>
          <p className="text-lg text-slate-500">Here&apos;s a list you made</p>
        </div>
        {/* TODO: 주소를 /admin/contest/create로 수정하기 */}
        <Link href="/admin/problem/create">
          <Button variant="default">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Create
          </Button>
        </Link>
      </div>
      <DataTableAdmin columns={columns} data={contests} />
    </div>
  )
}
