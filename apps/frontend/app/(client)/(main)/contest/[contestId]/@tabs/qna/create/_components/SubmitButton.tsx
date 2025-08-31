'use client'

import { Button } from '@/components/shadcn/button'
import penIcon from '@/public/icons/pen.svg'
import Image from 'next/image'

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
      <Image src={penIcon} alt="pen" width={16} height={16} />
      <span className="font-pretendard text-base font-medium not-italic leading-[140%] tracking-[-0.48px] text-white">
        Post
      </span>
    </Button>
  )
}
