import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useConfirmNavigation = (shouldSkipWarning: boolean) => {
  const router = useRouter()
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = ''
  }

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)

    const originalPush = router.push

    router.push = (href, ...args) => {
      if (shouldSkipWarning) {
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
}
