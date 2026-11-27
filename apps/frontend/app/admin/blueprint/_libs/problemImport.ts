import { Language, Level, type FilterProblemsInput } from '@generated/graphql'

export const PROBLEM_IMPORT_LIMIT = 20
export const PROBLEM_IMPORT_FILTER: FilterProblemsInput = {
  difficulty: [
    Level.Level1,
    Level.Level2,
    Level.Level3,
    Level.Level4,
    Level.Level5
  ],
  languages: [Language.C, Language.Cpp, Language.Java, Language.Python3]
}

export function hasProblemSolution(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.some(
      (solution: unknown) =>
        typeof solution === 'object' &&
        solution !== null &&
        'code' in solution &&
        typeof solution.code === 'string' &&
        solution.code.length > 0
    )
  )
}

export function uniqueProblems<T extends { id: string | number }>(
  items: readonly T[]
): T[] {
  return [
    ...new Map<number, T>(items.map((item) => [Number(item.id), item])).values()
  ]
}
