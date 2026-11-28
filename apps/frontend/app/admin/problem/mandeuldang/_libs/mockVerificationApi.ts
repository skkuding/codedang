import type { UploadedFile } from './types'

export interface VerificationResult {
  failedCount: number
  verifiedAt: string
}

// TODO: 솔루션 / Validator 업로드 및 검증 API 연동 후 이 파일을 실제 API로 교체
const MOCK_SCENARIO: {
  uploadFails: boolean
  verificationOutcome: 'Passed' | 'Failed' | 'Error'
} = {
  uploadFails: false,
  verificationOutcome: 'Passed'
}

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const mockUploadFile = async (file: File): Promise<UploadedFile> => {
  await wait(500)
  if (MOCK_SCENARIO.uploadFails) {
    throw new Error('파일을 업로드하지 못했습니다.')
  }
  return {
    name: file.name,
    size: file.size,
    createdAt: new Date().toISOString()
  }
}

const mockVerify = async (
  onRunning: () => void
): Promise<VerificationResult> => {
  await wait(800)
  onRunning()
  await wait(1500)

  if (MOCK_SCENARIO.verificationOutcome === 'Error') {
    throw new Error('process exited with non-zero status (exit code 1)')
  }
  return {
    failedCount: MOCK_SCENARIO.verificationOutcome === 'Failed' ? 3 : 0,
    verifiedAt: new Date().toISOString()
  }
}

export const mockUploadSolution = mockUploadFile
export const mockUploadValidator = mockUploadFile
export const mockRunSolutionVerification = mockVerify
export const mockRunValidation = mockVerify
