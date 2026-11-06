import { UnprocessableDataException } from '@libs/exception'
import type { ProblemWithIsVisible } from '../model/problem.output'

const LEGACY_CONTENT_FIELDS = [
  'description',
  'inputDescription',
  'outputDescription',
  'hint',
  'timeLimit',
  'memoryLimit',
  'difficulty',
  'source'
] as const

type LegacyContentField = (typeof LEGACY_CONTENT_FIELDS)[number]

type LegacyProblemContent = Pick<ProblemWithIsVisible, LegacyContentField>

type NullableLegacyProblemContent = {
  [K in LegacyContentField]: LegacyProblemContent[K] | null | undefined
}

export const assertLegacyProblemContent: <
  T extends NullableLegacyProblemContent
>(
  problem: T
) => asserts problem is T & LegacyProblemContent = (problem) => {
  for (const field of LEGACY_CONTENT_FIELDS) {
    if (problem[field] === null || problem[field] === undefined) {
      throw new UnprocessableDataException(
        `Legacy problem response requires a non-null ${field}`
      )
    }
  }
}
