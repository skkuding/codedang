import {
  PROBLEM_IMPORT_FILTER,
  hasProblemSolution
} from '@/app/admin/_libs/problemImport'
import { isApolloError } from '@apollo/client'
import type {
  GetProblemsQuery,
  GetProblemsQueryVariables
} from '@generated/graphql'
import type { BlueprintCreateProblem } from './createTypes'

export const BLUEPRINT_PROBLEM_PAGE_SIZE = 50
export type BlueprintProblemMode = 'my' | 'shared'
export type BlueprintProblemError = 'error' | 'unauthenticated' | 'forbidden'

export function blueprintProblemVariables(
  mode: BlueprintProblemMode,
  cursor: number | null
): GetProblemsQueryVariables {
  return {
    mode,
    take: BLUEPRINT_PROBLEM_PAGE_SIZE,
    cursor,
    input: PROBLEM_IMPORT_FILTER
  }
}

export function mapBlueprintProblem(
  problem: GetProblemsQuery['getProblems'][number]
): BlueprintCreateProblem {
  const id = Number(problem.id)
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Problem response contains an invalid ID')
  }
  return {
    id,
    title: problem.title,
    level: problem.difficulty,
    hasSolution: hasProblemSolution(problem.solution)
  }
}

export function blueprintProblemError(error: unknown): BlueprintProblemError {
  if (error instanceof Error && isApolloError(error)) {
    const codes = error.graphQLErrors.map((item) => item.extensions?.code)
    const status =
      error.networkError && 'statusCode' in error.networkError
        ? error.networkError.statusCode
        : undefined
    if (status === 401 || codes.includes('UNAUTHENTICATED')) {
      return 'unauthenticated'
    }
    if (status === 403 || codes.includes('FORBIDDEN')) {
      return 'forbidden'
    }
  }
  return 'error'
}
