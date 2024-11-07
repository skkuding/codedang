import type { Route } from 'next'
import type { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import type { MutableRefObject } from 'react'
import { useEffect } from 'react'
import { toast } from 'sonner'

// const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
//   // Recommended
//   event.preventDefault()

//   // Included for legacy support, e.g. Chrome/Edge < 119
//   event.returnValue = true
//   return true
// }

/**
 * Prompt the user with a confirmation dialog when they try to navigate away from the page.
 */
export const useConfirmNavigation = (
  bypassConfirmation: MutableRefObject<boolean>,
  updateNow: boolean
) => {
  const router = useRouter()
  useEffect(() => {
    const originalPush = router.push
    const newPush = (
      href: string,
      options?: NavigateOptions | undefined
    ): void => {
      if (updateNow) {
        if (!bypassConfirmation.current) {
          toast.error('You must update your information')
        } else {
          originalPush(href as Route, options)
        }
        return
      }
      if (!bypassConfirmation.current) {
        const isConfirmed = window.confirm(
          'Are you sure you want to leave?\nYour changes have not been saved.\nIf you leave this page, all changes will be lost.\nDo you still want to proceed?'
        )
        if (isConfirmed) {
          originalPush(href as Route, options)
        }
        return
      }
      originalPush(href as Route, options)
    }
    router.push = newPush
    return () => {
      router.push = originalPush
    }
  }, [router, bypassConfirmation.current])
}
