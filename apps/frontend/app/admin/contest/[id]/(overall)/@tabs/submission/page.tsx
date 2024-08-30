'use client'

import type { OverallSubmission } from '@/app/admin/contest/utils'
import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Skeleton } from '@/components/ui/skeleton'
import { GET_CONTEST_SUBMISSIONS } from '@/graphql/submission/queries'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { columns } from './_components/Columns'

export default function Submission() {
  const { id } = useParams()
  const { data, loading } = useQuery(GET_CONTEST_SUBMISSIONS, {
    variables: {
      input: {
        contestId: Number(id)
      },
      take: 10
    }
  })
  const submissions = data?.getContestSubmissions || []
  return (
    <div>
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
          data={submissions as OverallSubmission[]}
          enableSearch={true}
          searchColumn="realname"
          enablePagination={true}
          enableFilter={true}
          enableProblemFilter={true}
          defaultSortColumn={{ id: 'submissionTime', desc: true }}
        />
      )}
    </div>
  )
}
