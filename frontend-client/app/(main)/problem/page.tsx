import DataTable from '@/components/DataTable'
import SearchBar from '@/components/SearchBar'
import { fetcher } from '@/lib/utils'
import type { Problem } from '@/types/type'
import { columns } from './_components/Columns'

interface ProblemProps {
  searchParams: { search: string; tag: string; order: string }
}

export default async function Problem({ searchParams }: ProblemProps) {
  const search = searchParams?.search ?? ''
  const order = searchParams?.order ?? 'id-asc'
  const problems: Problem[] = await fetcher
    .get('problem', {
      searchParams: {
        take: 10,
        search,
        order
      }
    })
    .json()

  return (
    <>
      <div className="flex justify-between text-gray-500">
        <p className="text-xl font-extrabold">
          All <span className="text-primary">{problems.length}</span>
        </p>
        <SearchBar />
      </div>
      <DataTable
        data={problems}
        columns={columns}
        headerStyle={{
          title: 'text-left w-5/12',
          difficulty: 'w-2/12',
          submissionCount: 'w-2/12',
          acceptedRate: 'w-2/12',
          info: 'w-1/12'
        }}
        name="problem"
      />
    </>
  )
}
