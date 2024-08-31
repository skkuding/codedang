import { useRouter } from 'next/navigation'
import type { MutableRefObject } from 'react'
import { useEffect } from 'react'

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
