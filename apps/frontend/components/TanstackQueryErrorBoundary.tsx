'use client'

import {
  ErrorBoundary,
  type ErrorBoundaryFallbackProps
} from '@suspensive/react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { FunctionComponent, ReactNode } from 'react'

interface TanstackQueryErrorBoundaryProps {
  children: ReactNode
  fallback: FunctionComponent<ErrorBoundaryFallbackProps<Error>>
}

export function TanstackQueryErrorBoundary({
  children,
  fallback
}: TanstackQueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} fallback={fallback}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
