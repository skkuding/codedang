'use client'

import { useQuery, type QueryKey } from '@tanstack/react-query'
import type { BlueprintReadResult, BlueprintReadState } from './types'

export function useBlueprintRead<T>(
  key: QueryKey,
  read: (() => Promise<BlueprintReadResult<T>>) | null
): BlueprintReadState<T> | null {
  const query = useQuery({
    queryKey: key,
    queryFn:
      read ??
      (() =>
        Promise.reject(new Error('Blueprint read adapter is unavailable'))),
    enabled: read !== null,
    retry: false
  })
  if (read === null) {
    return null
  }
  if (query.isPending) {
    return { status: 'loading' }
  }
  if (query.isError) {
    return {
      status: 'error',
      onRetry: () => {
        void query.refetch()
      }
    }
  }
  return query.data
}
