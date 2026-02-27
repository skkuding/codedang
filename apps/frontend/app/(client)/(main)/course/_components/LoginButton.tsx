'use client'

import { Button } from '@/components/shadcn/button'
import { useAuthModalStore } from '@/stores/authModal'
import { useTranslate } from '@tolgee/react'

interface LoginButtonProps {
  className?: string
}

export function LoginButton({ className }: LoginButtonProps) {
  const showSignIn = useAuthModalStore((state) => state.showSignIn)
  const { t } = useTranslate()

  return (
    <Button onClick={() => showSignIn()} className={className}>
      {t('log_in_button')}
    </Button>
  )
}
