import type { GeneratedTestcase, UploadedFile } from './types'

// TODO: Generator / INPUT 생성 API 연동 후 이 파일을 실제 API로 교체
const MOCK_SCENARIO: {
  uploadFails: boolean
  generationOutcome: 'Success' | 'Failed' | 'Empty'
} = {
  uploadFails: false,
  generationOutcome: 'Success'
}

const MOCK_PREVIEW = `1 2
5 10
13 7
256 1024
100000 7
999999 100
42 17
8 64
77 3
1000 1000`

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const mockUploadGenerator = async (
  file: File
): Promise<UploadedFile> => {
  await wait(500)
  if (MOCK_SCENARIO.uploadFails) {
    throw new Error('Generator 파일을 업로드하지 못했습니다.')
  }
  return {
    name: file.name,
    size: file.size,
    createdAt: new Date().toISOString()
  }
}

export const mockGenerateInput = async (
  onRunning: () => void
): Promise<GeneratedTestcase> => {
  await wait(800)
  onRunning()
  await wait(1500)

  if (MOCK_SCENARIO.generationOutcome === 'Failed') {
    throw new Error('generator exited with non-zero status (exit code 1)')
  }
  const isEmpty = MOCK_SCENARIO.generationOutcome === 'Empty'
  return {
    preview: isEmpty ? '' : MOCK_PREVIEW,
    testCaseCount: isEmpty ? 0 : 235,
    generatedAt: new Date().toISOString()
  }
}
