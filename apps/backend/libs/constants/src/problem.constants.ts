import { ProblemStatus } from '@prisma/client'

/**
 * Where clause that excludes unpublished (Draft/Ready) Mandeuldang problems
 * from general problem queries and submission paths.
 */
export const PUBLISHED_PROBLEM_WHERE = {
  status: ProblemStatus.Published
} as const
