'use client'

import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { GET_CONTESTS } from '@/graphql/contest/queries'
import { useQuery } from '@apollo/client'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { columns } from './_components/Columns'

export const dynamic = 'force-dynamic'

export default function Page() {
  const { data, loading } = useQuery(GET_CONTESTS, {
    variables: {
      groupId: 1,
      take: 300
    }
  })

  const contests =
    data?.getContests.map((contest) => ({
      ...contest,
      id: Number(contest.id)
    })) || []

  return (
    <ScrollArea className="shrink-0">
      <div className="container mx-auto space-y-5 py-10">
        <div className="flex justify-between">
          <div>
            <p className="text-4xl font-bold">Contest List</p>
            <p className="text-lg text-slate-500">
              Here&apos;s a list you made
            </p>
          </div>
          <Button variant="default" asChild>
            <Link href="/admin/contest/create">
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create
            </Link>
          </Button>
        </div>
        {loading ? (
          <>
            <div className="mb-16 flex gap-4">
              <span className="w-2/12">
                <Skeleton className="h-10 w-full" />
              </span>
            </div>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="my-2 flex h-12 w-full rounded-xl" />
            ))}
          </>
        ) : (
          <DataTableAdmin
            columns={columns}
            data={contests}
            enableSearch={true}
            enableDelete={true}
            enablePagination={true}
            headerStyle={{
              select: '',
              title: 'w-3/5',
              startTime: 'px-0 w-1/5',
              participants: 'px-0 w-1/12',
              isVisible: 'px-0 w-1/12'
            }}
          />
        )}
      </div>
    </ScrollArea>
  )
}
