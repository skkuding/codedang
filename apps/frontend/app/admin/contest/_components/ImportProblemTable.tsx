import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Skeleton } from '@/components/ui/skeleton'
import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { columns } from '../[id]/edit/_components/Columns'

interface ContestProblem {
  id: number
  title: string
  difficulty: string
}

interface OrderContestProblem {
  id: number
  title: string
  difficulty: string
  order: number
}

export default function ImportProblemTable({
  checkedProblems,
  onSelectedExport,
  onCloseDialog
}: {
  checkedProblems: ContestProblem[]
  onSelectedExport: (selectedRows: OrderContestProblem[]) => void
  onCloseDialog: () => void
}) {
  const { data, loading } = useQuery(GET_PROBLEMS, {
    variables: {
      groupId: 1,
      take: 500,
      input: {
        difficulty: [
          Level.Level1,
          Level.Level2,
          Level.Level3,
          Level.Level4,
          Level.Level5
        ],
        languages: [Language.C, Language.Cpp, Language.Java, Language.Python3]
      }
    }
  })

  const problems =
    data?.getProblems.map((problem) => ({
      ...problem,
      id: Number(problem.id),
      isVisible: problem.isVisible !== undefined ? problem.isVisible : null,
      languages: problem.languages ?? [],
      tag: problem.tag.map(({ id, tag }) => ({
        id: +id,
        tag: {
          ...tag,
          id: +tag.id
        }
      }))
    })) ?? []
  return (
    <>
      {loading ? (
        <>
          <div className="mb-16 flex gap-4">
            <span className="w-2/12">
              <Skeleton className="h-10 w-full" />
            </span>
            <span className="w-1/12">
              <Skeleton className="h-10 w-full" />
            </span>
            <span className="w-1/12">
              <Skeleton className="h-10 w-full" />
            </span>
          </div>
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="my-2 flex h-12 w-full rounded-xl" />
          ))}
        </>
      ) : (
        <DataTableAdmin
          columns={columns}
          data={problems}
          enableSearch={true}
          enableFilter={true}
          enableDelete={false}
          enablePagination={true}
          enableRowsPerpage={false}
          enableImport={true}
          checkedRows={checkedProblems}
          onSelectedExport={(problems) => {
            onCloseDialog()
            const problemsWithOrder = problems.map((problem, index) => {
              return { ...problem, order: index }
            })
            onSelectedExport(problemsWithOrder)
          }}
        />
      )}
    </>
  )
}
