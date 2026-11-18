import type { GeneratedTestcase } from './types'

// TODO: OUTPUT 생성(기준 Solution 실행) API 연동 후 이 파일을 실제 API로 교체
const MOCK_SCENARIO: {
  generationOutcome: 'Success' | 'Failed' | 'Empty'
} = {
  generationOutcome: 'Success'
}

const MOCK_PREVIEW = `3
15
20
1280
700000
117
81
64
94
2000`

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const mockGenerateOutput = async (
  onRunning: () => void
): Promise<GeneratedTestcase> => {
  await wait(800)
  onRunning()
  await wait(1500)

  if (MOCK_SCENARIO.generationOutcome === 'Failed') {
    throw new Error('solution exited with non-zero status (exit code 1)')
  }
  const isEmpty = MOCK_SCENARIO.generationOutcome === 'Empty'
  return {
    preview: isEmpty ? '' : MOCK_PREVIEW,
    testCaseCount: isEmpty ? 0 : 235,
    generatedAt: new Date().toISOString()
  }
}
