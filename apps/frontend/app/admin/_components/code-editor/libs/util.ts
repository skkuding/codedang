import type { ProblemTestcase, TestCaseResult } from '@generated/graphql'

export function mapTestResults(
  testcases: Pick<ProblemTestcase, 'id' | 'input' | 'output' | 'order'>[],
  results: TestCaseResult[]
) {
  return results.map((result) => {
    const testcase = testcases.find(
      (tc) => Number(tc.id) === result.problemTestcaseId
    )
    return {
      ...result,
      input: testcase?.input || '',
      expectedOutput: testcase?.output || '',
      order: testcase?.order || 0
    }
  })
}
