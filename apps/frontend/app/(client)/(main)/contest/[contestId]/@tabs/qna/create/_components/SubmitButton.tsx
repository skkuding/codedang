'use client'

import { Button } from '@/components/shadcn/button'
import PenIcon from '@/public/icons/pen.svg'

interface SubmitButtonProps {
  isFormValid: boolean
  isLoadingProblems: boolean
  onSubmit: () => void
  canCreateQnA: boolean
}

export function SubmitButton({
  isFormValid,
  isLoadingProblems,
  onSubmit,
  canCreateQnA
}: SubmitButtonProps) {
  return (
    <Button
      onClick={onSubmit}
      className="mb-[120px] flex h-[46px] w-full items-center justify-center gap-[6px] !px-6 !py-3"
      disabled={!isFormValid || isLoadingProblems}
      variant={canCreateQnA ? 'default' : 'secondary'}
    >
      <PenIcon className="w-4 text-white" />
      <span className="font-pretendard text-base font-medium not-italic leading-[140%] tracking-[-0.48px] text-white">
        Post
      </span>
    </Button>
  )
}
