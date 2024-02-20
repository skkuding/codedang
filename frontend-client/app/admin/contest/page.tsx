'use client'

import { gql } from '@generated'
import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Button } from '@/components/ui/button'
import { useQuery } from '@apollo/client'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { columns } from './_components/Columns'

export const dynamic = 'force-dynamic'

const GET_CONTESTS = gql(`
  query getContests {
    getContests {
      id
      title
      startTime
      endTime
      participants
    }
  }
`)

export default function Page() {
  const { data } = useQuery(GET_CONTESTS)

  const contests = data?.getContests || []

  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <div>
          <p className="text-4xl font-bold">Contest List</p>
          <p className="text-lg text-slate-500">Here&apos;s a list you made</p>
        </div>
        {/* TODO: 주소를 /admin/contest/create로 수정하기 */}
        <Button variant="default" asChild>
          <Link href="/admin/problem/create">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Create
          </Link>
        </Button>
      </div>
      <DataTableAdmin columns={columns} data={contests} />
    </div>
  )
}
