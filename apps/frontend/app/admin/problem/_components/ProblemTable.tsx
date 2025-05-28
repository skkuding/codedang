'use client'

import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useSession } from '@/libs/hooks/useSession'
import { safeFetcherWithAuth } from '@/libs/utils'
import type { User } from '@/types/type'
import { useSuspenseQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { useEffect } from 'react'
import { create } from 'zustand'
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

const usePermissionStore = create<{
  canCreateContest: boolean
  setCanCreateContest: (value: boolean) => void
}>((set) => ({
  canCreateContest: false,
  setCanCreateContest: (value) => set({ canCreateContest: value })
}))

export function ProblemTable() {
  const { canCreateContest, setCanCreateContest } = usePermissionStore()
  const session = useSession()
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

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const user: User = await safeFetcherWithAuth.get('user').json()
        console.log('User permissions:', user)
        setCanCreateContest(user.canCreateContest ?? false)
      } catch (error) {
        console.error('Error fetching user permissions:', error)
      }
    }

    if (session) {
      fetchUserPermissions()
    }
  }, [session])

  return (
    <DataTableRoot
      data={problems}
      columns={createColumns(canCreateContest)}
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
  const { canCreateContest } = usePermissionStore()
  return <DataTableFallback columns={createColumns(canCreateContest)} />
}
