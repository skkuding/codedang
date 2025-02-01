import { BootstrapContext } from '@/app/posthog'
import { usePostHog } from 'posthog-js/react'
import { useContext, useEffect, useState } from 'react'

export const useFeatureFlag = (key: string) => {
  const bootstrapContext = useContext(BootstrapContext)
  const initialFlag = bootstrapContext
    ? bootstrapContext.featureFlags?.[key]
    : undefined

  const posthog = usePostHog()
  const [flag, setFlag] = useState(initialFlag)

  useEffect(() => {
    const flag = posthog.getFeatureFlag(key)
    setFlag(flag)
  }, [posthog, key])

  return flag
}
