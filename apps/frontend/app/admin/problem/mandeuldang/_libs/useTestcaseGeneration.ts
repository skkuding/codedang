import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { GeneratedTestcase, GenerationStatus } from './types'

const GENERATION_STATUS = {
  idle: 'Idle',
  pending: 'Pending',
  success: 'Success',
  error: 'Failed'
} as const

export function useTestcaseGeneration(
  requestGeneration: (onRunning: () => void) => Promise<GeneratedTestcase>
) {
  const [isRunning, setIsRunning] = useState(false)
  const { mutate, reset, status, data, error } = useMutation({
    onMutate: () => setIsRunning(false),
    mutationFn: async () => {
      const result = await requestGeneration(() => setIsRunning(true))
      if (result.testCaseCount === 0) {
        throw new Error('생성된 테스트케이스가 없습니다.')
      }
      return result
    }
  })

  const generationStatus: GenerationStatus =
    status === 'pending' && isRunning ? 'Running' : GENERATION_STATUS[status]

  return {
    status: generationStatus,
    generatedTestcase: data ?? null,
    errorMessage: error?.message ?? null,
    isGenerating: status === 'pending',
    generate: () => mutate(),
    reset
  }
}
