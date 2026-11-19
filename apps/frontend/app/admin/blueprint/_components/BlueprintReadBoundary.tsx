'use client'

import { Button } from '@/components/shadcn/button'
import type { ReactNode } from 'react'
import type { BlueprintReadState } from '../_libs/types'

export function BlueprintReadBoundary<T>({
  state,
  children
}: {
  state: BlueprintReadState<T>
  children: (data: T) => ReactNode
}) {
  switch (state.status) {
    case 'loading':
      return <p role="status">Loading Blueprint content…</p>
    case 'forbidden':
      return (
        <p role="alert">You do not have access to this Blueprint content.</p>
      )
    case 'not-found':
      return <p role="alert">This Blueprint content could not be found.</p>
    case 'error':
      return (
        <div role="alert" className="flex items-center gap-4">
          <p>Could not load Blueprint content.</p>
          <Button type="button" variant="outline" onClick={state.onRetry}>
            Retry
          </Button>
        </div>
      )
    case 'success':
      return children(state.data)
  }
}
