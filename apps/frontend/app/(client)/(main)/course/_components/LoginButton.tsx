'use client'

import { Button } from '@/components/shadcn/button'
import { useAuthModalStore } from '@/stores/authModal'

interface LoginButtonProps {
  className?: string
}

export function LoginButton({ className }: LoginButtonProps) {
  const showSignIn = useAuthModalStore((state) => state.showSignIn)

  return (
    <Button onClick={() => showSignIn()} className={className}>
      Log in
    </Button>
  )
}
