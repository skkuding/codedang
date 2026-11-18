import type { ProblemTestcase, TestCaseResult } from '@generated/graphql'

export function mapTestResults(
  testcases: Pick<ProblemTestcase, 'id' | 'order' | 'isHidden'>[],
  results: Omit<TestCaseResult, 'problemTestcase'>[]
) {
  return results.map((result) => {
    const testcase = testcases.find(
      (tc) => Number(tc.id) === result.problemTestcaseId
    )
    return {
      ...result,
      isHidden: testcase?.isHidden || false,
      order: testcase?.order || 0
    }
  })
}
