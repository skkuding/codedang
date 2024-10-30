import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import { DELETE_PROBLEM } from '@/graphql/problem/mutations'
import { GET_PROBLEMS } from '@/graphql/problem/queries'
import {
  useApolloClient,
  useLazyQuery,
  useMutation,
  useSuspenseQuery
} from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { toast } from 'sonner'
import DataTable from '../../_components/table/DataTable'
import DataTableDeleteButton from '../../_components/table/DataTableDeleteButton'
import DataTableFallback from '../../_components/table/DataTableFallback'
import DataTableLangFilter from '../../_components/table/DataTableLangFilter'
import DataTableLevelFilter from '../../_components/table/DataTableLevelFilter'
import DataTablePagination from '../../_components/table/DataTablePagination'
import DataTableRoot from '../../_components/table/DataTableRoot'
import DataTableSearchBar from '../../_components/table/DataTableSearchBar'
import { columns, type DataTableProblem } from './ProblemTableColumns'

export function ProblemTable() {
  const { data } = useSuspenseQuery(GET_PROBLEMS, {
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

  const problems = data.getProblems.map((problem) => ({
    ...problem,
    id: Number(problem.id),
    isVisible: problem.isVisible !== undefined ? problem.isVisible : null,
    languages: problem.languages ?? [],
    tag: problem.tag.map(({ id, tag }) => ({
      id: +id,
      tag: {
        ...tag,
        id: Number(tag.id)
      }
    }))
  }))

  return (
    <DataTableRoot
      data={problems}
      columns={columns}
      defaultSortState={[{ id: 'updateTime', desc: true }]}
    >
      <div className="flex gap-4">
        <DataTableSearchBar columndId="title" />
        <DataTableLangFilter />
        <DataTableLevelFilter />
        <ProblemsDeleteButton />
      </div>
      <DataTable getHref={(data) => `/admin/problem/${data.id}`} />
      <DataTablePagination showSelection />
    </DataTableRoot>
  )
}

function ProblemsDeleteButton() {
  const client = useApolloClient()
  const [deleteProblem] = useMutation(DELETE_PROBLEM)
  const [fetchContests] = useLazyQuery(GET_BELONGED_CONTESTS)

  const getCanDelete = async (data: DataTableProblem[]) => {
    const promises = data.map((item) =>
      fetchContests({
        variables: {
          problemId: Number(item.id)
        }
      })
    )
    const results = await Promise.all(promises)
    const isAllSafe = results.every(({ data }) => data === undefined)

    if (isAllSafe) {
      return true
    }

    toast.error('Failed: Problem included in the contest')
    return false
  }

  const deleteTarget = (id: number) => {
    return deleteProblem({
      variables: {
        groupId: 1,
        id
      }
    })
  }

  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_PROBLEMS]
    })
  }

  return (
    <DataTableDeleteButton
      target="problem"
      getCanDelete={getCanDelete}
      deleteTarget={deleteTarget}
      onSuccess={onSuccess}
      className="ml-auto"
    />
  )
}

export function ProblemTableFallback() {
  return <DataTableFallback columns={columns} />
}
