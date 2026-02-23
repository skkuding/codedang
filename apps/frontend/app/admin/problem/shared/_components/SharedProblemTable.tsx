import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import {
  DataTable,
  DataTableFallback,
  DataTableLangFilter,
  DataTableLevelFilter,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '../../../_components/table'
import { ProblemsDownload } from '../../_components/ProblemsDownload'
import { getColumns } from '../_components/SharedProblemTableColumns'

export function SharedProblemTable() {
  const { t } = useTranslate()
  const columns = getColumns(t)
  const { data } = useSuspenseQuery(GET_PROBLEMS, {
    variables: {
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
      },
      mode: 'shared'
    }
  })

  const problems = data.getProblems.map((problem) => ({
    ...problem,
    id: Number(problem.id),
    languages: problem.languages ?? [],
    tag: problem.tag.map(({ id, tag }) => ({
      id: Number(id),
      tag: {
        ...tag,
        id: Number(tag.id)
      }
    }))
  }))
  const bodyStyle = { title: 'justify-start' }

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
        <div className="ml-auto flex gap-2">
          <ProblemsDownload />
        </div>
      </div>
      <DataTable
        getHref={(data) => `/admin/problem/${data.id}`}
        bodyStyle={bodyStyle}
      />
      <DataTablePagination showSelection />
    </DataTableRoot>
  )
}

export function SharedProblemTableFallback() {
  return <DataTableFallback columns={getColumns(() => '')} />
}
