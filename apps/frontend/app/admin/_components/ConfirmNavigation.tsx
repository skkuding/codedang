'use client'

import { useRouter } from 'next/navigation'
import type { MutableRefObject, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useRef } from 'react'

export const useConfirmNavigation = (
  shouldSkipWarningRef: MutableRefObject<boolean>
) => {
  const router = useRouter()
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = ''
  }

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)

    const originalPush = router.push

    router.push = (href, ...args) => {
      if (shouldSkipWarningRef.current) {
        originalPush(href, ...args)
        return
      }
      const shouldWarn = window.confirm(
        'Are you sure you want to leave this page? Changes you made may not be saved.'
      )
      if (shouldWarn) {
        originalPush(href, ...args)
      }
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      router.push = originalPush
    }
  }, [router, shouldSkipWarningRef])
}

interface ConfirmNavigationProps {
  children: ReactNode
}

interface Context {
  setShouldSkipWarning: (value: boolean) => void
}

const ConfirmNavigationContext = createContext<Context | undefined>(undefined)

export default function ConfirmNavigation({
  children
}: ConfirmNavigationProps) {
  const shouldSkipWarning = useRef(false)

  const router = useRouter()
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = ''
  }

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)

    const originalPush = router.push

    router.push = (href, ...args) => {
      if (shouldSkipWarning.current) {
        originalPush(href, ...args)
        return
      }
      const shouldWarn = window.confirm(
        'Are you sure you want to leave this page? Changes you made may not be saved.'
      )
      if (shouldWarn) {
        originalPush(href, ...args)
      }
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      router.push = originalPush
    }
  }, [router, shouldSkipWarning])

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
