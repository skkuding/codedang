export interface GeneratorRequest {
  requestId: number
  problemId: number
  generatorLanguage: string
  generatorCode: string
  generatorArgs: string[]
  solutionLanguage: string
  solutionCode: string
  testCaseCount: number
}

export interface ValidatorRequest {
  requestId: number
  problemId: number
  language: string
  validatorCode: string
}
