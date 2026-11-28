import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { VerificationResult } from './mockVerificationApi'
import type { GenerationStatus } from './types'

const VERIFICATION_STATUS = {
  idle: 'Idle',
  pending: 'Pending',
  success: 'Success',
  error: 'Failed'
} as const

/**
 * 검증 실행 상태를 관리합니다.
 * reset()을 호출하면 진행 중이던 이전 실행의 결과는 화면에 반영되지 않습니다.
 */
export function useVerification(
  requestVerification: (onRunning: () => void) => Promise<VerificationResult>
) {
  const [isRunning, setIsRunning] = useState(false)
  const { mutate, reset, status, data, error } = useMutation({
    onMutate: () => setIsRunning(false),
    mutationFn: () => requestVerification(() => setIsRunning(true))
  })

  const verificationStatus: GenerationStatus =
    status === 'pending' && isRunning ? 'Running' : VERIFICATION_STATUS[status]

  return {
    status: verificationStatus,
    result: data ?? null,
    errorMessage: error?.message ?? null,
    isVerifying: status === 'pending',
    verify: () => mutate(),
    reset
  }
}
