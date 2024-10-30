import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import DataTable from '../../_components/table/DataTable'
import DataTableFallback from '../../_components/table/DataTableFallback'
import DataTableLangFilter from '../../_components/table/DataTableLangFilter'
import DataTableLevelFilter from '../../_components/table/DataTableLevelFilter'
import DataTablePagination from '../../_components/table/DataTablePagination'
import DataTableRoot from '../../_components/table/DataTableRoot'
import DataTableSearchBar from '../../_components/table/DataTableSearchBar'
import { columns } from './ProblemTableColumns'
import ProblemsDeleteButton from './ProblemsDeleteButton'

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

export function ProblemTableFallback() {
  return <DataTableFallback columns={columns} />
}
