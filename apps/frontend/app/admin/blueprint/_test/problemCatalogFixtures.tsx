import { MockedProvider } from '@apollo/client/testing'
import type { MockedResponse } from '@apollo/client/testing'
import { GetProblemsDocument, Level } from '@generated/graphql'
import type {
  GetProblemsQuery,
  GetProblemsQueryVariables
} from '@generated/graphql'
import type { PropsWithChildren } from 'react'
import { blueprintProblemVariables } from '../_libs/problemCatalog'

export type ProblemRow = GetProblemsQuery['getProblems'][number]
export type ProblemQueryMock = MockedResponse<
  GetProblemsQuery,
  GetProblemsQueryVariables
>

export function problemRow(
  id: number,
  overrides: Partial<ProblemRow> = {}
): ProblemRow {
  return {
    id: String(id),
    title: `Problem ${id}`,
    difficulty: Level.Level2,
    solution: [],
    updateTime: '2026-11-16T00:00:00Z',
    updateContentTime: null,
    isVisible: null,
    languages: [],
    createdBy: null,
    submissionCount: 0,
    acceptedRate: 0,
    tag: [],
    ...overrides
  }
}

export function problemPage(
  mode: 'my' | 'shared',
  rows: ProblemRow[],
  cursor: number | null = null
): ProblemQueryMock {
  return {
    request: {
      query: GetProblemsDocument,
      variables: blueprintProblemVariables(mode, cursor)
    },
    result: { data: { getProblems: rows } }
  }
}

export function problemCatalogWrapper(mocks: ProblemQueryMock[]) {
  return function CatalogProvider({ children }: PropsWithChildren) {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    )
  }
}
