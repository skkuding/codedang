'use client'

import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import {
  DataTable,
  DataTableFallback,
  DataTableLangFilter,
  DataTableLevelFilter,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '../../_components/table'
import { createColumns } from './ProblemTableColumns'
import { ProblemsDeleteButton } from './ProblemsDeleteButton'

export function ProblemTable() {
  console.log('render page')
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
        languages: [
          Language.C,
          Language.Cpp,
          Language.Java,
          Language.Python3,
          Language.PyPy3
        ]
      },
      mode: 'my'
    }
  })

  const problems = data.getProblems.map((problem) => ({
    ...problem,
    id: Number(problem.id),
    isVisible: problem.isVisible !== undefined ? problem.isVisible : null,
    languages: problem.languages ?? [],
    tag: problem.tag.map(({ id, tag }) => ({
      id: Number(id),
      tag: {
        ...tag,
        id: Number(tag.id)
      }
    }))
  }))
  console.log('problems: ', problems)

  return (
    <DataTableRoot
      data={problems}
      columns={createColumns()}
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
  return <DataTableFallback columns={createColumns()} />
}
