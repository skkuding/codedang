export type TestcaseTarget = 'Input' | 'Output'

export type GenerationStatus =
  | 'Idle'
  | 'Pending'
  | 'Running'
  | 'Success'
  | 'Failed'

export interface UploadedFile {
  name: string
  size: number
  createdAt: string
}

export interface GeneratedTestcase {
  preview: string
  testCaseCount: number
  generatedAt: string
}
