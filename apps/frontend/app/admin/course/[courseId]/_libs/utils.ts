import type { ApolloCache } from '@apollo/client'

export const isOptionAfterDeadline = (solutionReleaseTime: Date | null) => {
  const dummyReleaseTime = new Date('2025-01-01')
  if (!solutionReleaseTime) {
    return false
  }
  return solutionReleaseTime.toString() === dummyReleaseTime.toString()
}

export const evictAssignmentQueries = (cache: ApolloCache<unknown>) => {
  cache.batch({
    update(cache) {
      for (const fieldName of [
        'getAssignments',
        'getAssignmentsByProblemId',
        'getAssignment',
        'getAssignmentProblems',
        'getAssignmentScoreSummaries',
        'getAssignmentSubmissionSummaryByUserId',
        'getAssignmentProblemRecord',
        'getAssignmentProblemTestcaseResults',
        'getAssignmentSubmissions',
        'getAssignmentLatestSubmission',
        'getProblems',
        'getProblem'
      ]) {
        cache.evict({ fieldName })
      }
    }
  })
}
