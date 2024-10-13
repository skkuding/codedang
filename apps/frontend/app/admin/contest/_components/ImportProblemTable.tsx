import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Skeleton } from '@/components/ui/skeleton'
import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { columns } from './ImportProblemTableColumns'

interface ContestProblem {
  id: number
  title: string
  difficulty: string
  score: number
  order: number
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
      })),
      score: checkedProblems.find((item) => item.id === Number(problem.id))
        ?.score
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

            const problemsWithOrder = problems
              .map((problem) => ({
                ...problem,
                order:
                  checkedProblems.find((item) => item.id === problem.id)
                    ?.order ?? Number.MAX_SAFE_INTEGER
              }))
              .sort((a, b) => a.order - b.order)

            let order = 0
            const exportedProblems = problemsWithOrder.map(
              (problem, index, arr) => {
                if (
                  index > 0 &&
                  // NOTE: 만약 현재 요소가 새로 추가된 문제이거나 새로 추가된 문제가 아니라면 이전 문제와 기존 순서가 다를 때
                  (arr[index].order === Number.MAX_SAFE_INTEGER ||
                    arr[index - 1].order !== arr[index].order)
                ) {
                  order++
                }
                return {
                  ...problem,
                  order
                }
              }
            )
            onSelectedExport(exportedProblems)
          }}
          defaultPageSize={5}
        />
      )}
    </>
  )
}
