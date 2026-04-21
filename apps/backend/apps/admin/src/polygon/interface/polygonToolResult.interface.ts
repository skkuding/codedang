export interface GeneratorResultMessage {
  submissionId: number
  resultCode: number
  judgeResult: {
    generatedTestCases: number
    totalTestCases: number
  }
  error: string
}

export interface ValidatorResultMessage {
  submissionId: number
  resultCode: number
  judgeResult: {
    isValid: boolean
    testcaseCount: number
    results: Array<{
      id: number
      isValid: boolean
    }>
  }
  error: string
}
