'use client'

import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'
import type { MutableRefObject, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useRef } from 'react'

export const useConfirmNavigation = (
  shouldSkipWarningRef: MutableRefObject<boolean>
) => {
  const { t } = useTranslate()
  const router = useRouter()

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = ''
  }

  useEffect(() => {
    // 페이지 로드 시 history state에 dummy 데이터 추가 (뒤로가기 감지용)
    window.history.pushState({ page: 'current' }, '', window.location.href)

    // 뒤로가기 이벤트 처리
    const handlePopState = () => {
      if (!shouldSkipWarningRef.current) {
        const shouldLeave = window.confirm(t('leave_confirmation'))

        if (shouldLeave) {
          // 사용자가 확인을 누르면 뒤로가기 허용
          shouldSkipWarningRef.current = true
          window.history.back()
        } else {
          // 사용자가 취소하면 현재 상태를 history에 다시 추가하여 뒤로가기 취소
          window.history.pushState(
            { page: 'current' },
            '',
            window.location.href
          )
        }
      }
    }

    // 페이지 이탈 시 경고
    window.addEventListener('beforeunload', handleBeforeUnload)
    // 뒤로가기 이벤트 감지
    window.addEventListener('popstate', handlePopState)

    // Next.js router 확장
    const originalPush = router.push
    router.push = (href, ...args) => {
      if (shouldSkipWarningRef.current) {
        originalPush(href, ...args)
        return
      }
      const shouldWarn = window.confirm(t('leave_confirmation'))
      if (shouldWarn) {
        originalPush(href, ...args)
      }
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      router.push = originalPush
    }
  }, [router, shouldSkipWarningRef, t])
}

interface ConfirmNavigationProps {
  children: ReactNode
}

interface Context {
  setShouldSkipWarning: (value: boolean) => void
}

const ConfirmNavigationContext = createContext<Context | undefined>(undefined)

export function ConfirmNavigation({ children }: ConfirmNavigationProps) {
  const { t } = useTranslate()
  const shouldSkipWarning = useRef(false)
  const router = useRouter()

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = ''
  }

  useEffect(() => {
    window.history.pushState({ page: 'current' }, '', window.location.href)

    const handlePopState = () => {
      if (!shouldSkipWarning.current) {
        const shouldLeave = window.confirm(t('leave_confirmation'))

        if (shouldLeave) {
          shouldSkipWarning.current = true
          router.back()
        } else {
          window.history.pushState(
            { page: 'current' },
            '',
            window.location.href
          )
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    const originalPush = router.push
    router.push = (href, ...args) => {
      if (shouldSkipWarning.current) {
        originalPush(href, ...args)
        return
      }
      const shouldWarn = window.confirm(t('leave_confirmation'))
      if (shouldWarn) {
        originalPush(href, ...args)
      }
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      router.push = originalPush
    }
  }, [router, shouldSkipWarning, t])

  const contextValue = useMemo(() => {
    const setShouldSkipWarning = (value: boolean) => {
      shouldSkipWarning.current = value
    }
    return {
      setShouldSkipWarning
    }
  }, [])

  return (
    <ConfirmNavigationContext.Provider value={contextValue}>
      {children}
    </ConfirmNavigationContext.Provider>
  )
}

export const useConfirmNavigationContext = () => {
  const context = useContext(ConfirmNavigationContext)

  if (context === undefined) {
    throw new Error(
      'useConfirmNavigationContext should used within the ConfirmNavigation component'
    )
  }

  return context
}
