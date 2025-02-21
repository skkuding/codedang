import { PostHog } from 'posthog-node'
import { cache } from 'react'
import { uuidv7 } from 'uuidv7'
import { auth } from './auth'

/**Get distinct ID and feature flags */
export async function getBootstrapData() {
  const session = await auth()
  const distinctID = session ? session.user.username : generateDistinctId()
  const client = getPostHog()

  if (client) {
    const flags = await client.getAllFlags(distinctID)
    const bootstrap = {
      distinctID,
      featureFlags: flags
    }

    return bootstrap
  }

  return undefined
}

/**Get feature flag by key in the server-side */
export const getFeatureFlag = async (key: string) => {
  const posthog = getPostHog()
  const bootstrapData = await getBootstrapData()
  const flag = bootstrapData
    ? await posthog?.getFeatureFlag(key, bootstrapData.distinctID)
    : false

  return flag
}

const getPostHog = () => {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null
  }

  const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '', {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST
  })

  return client
}

const generateDistinctId = cache(() => {
  const id = uuidv7()
  return id
})
