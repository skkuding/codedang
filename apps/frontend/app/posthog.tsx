'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import posthog, { type BootstrapConfig } from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { usePostHog } from 'posthog-js/react'
import type { ReactNode } from 'react'
import { createContext, useEffect } from 'react'

interface PostHogProviderProps {
  children: ReactNode
  bootstrap?: BootstrapConfig
}

export const BootstrapContext = createContext<BootstrapConfig | undefined>(
  undefined
)

export function PostHogProvider({ children, bootstrap }: PostHogProviderProps) {
  const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (KEY && typeof window !== 'undefined') {
    posthog.init(KEY, {
      api_host: HOST,
      bootstrap, // Remove a delay between initializing PostHog and fetching feature flags
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      capture_pageleave: true // Enable pageleave capture
    })
  }

  return (
    <PHProvider client={posthog}>
      <BootstrapContext.Provider value={bootstrap}>
        {children}
      </BootstrapContext.Provider>
    </PHProvider>
  )
}

export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        $current_url: url
      })
    }
  }, [pathname, searchParams, posthog])

  return null
}
