export interface GeneratorRequest {
  problemId: number
  generatorLanguage: string
  generatorCode: string
  generatorArgs: string[]
  solutionLanguage: string
  solutionCode: string
  testCaseCount: number
}

export interface ValidatorRequest {
  problemId: number
  language: string
  validatorCode: string
}
