import type { Route } from 'next'
import type { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import type { MutableRefObject } from 'react'
import { useEffect, useState } from 'react'
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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {})

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
        setIsConfirmModalOpen(true)
        setConfirmAction(() => () => {
          setIsConfirmModalOpen(false)
          originalPush(href as Route, options)
        })
        return
      }
      originalPush(href as Route, options)
    }
    router.push = newPush
    return () => {
      router.push = originalPush
    }
  }, [router, bypassConfirmation.current])

  return { isConfirmModalOpen, setIsConfirmModalOpen, confirmAction }
}
