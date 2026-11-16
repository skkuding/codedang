'use client'

import { uniqueProblems } from '@/app/admin/_libs/problemImport'
import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { NetworkStatus, useQuery } from '@apollo/client'
import { useRef, useState } from 'react'
import type { BlueprintCreateProblem } from './createTypes'
import {
  BLUEPRINT_PROBLEM_PAGE_SIZE,
  blueprintProblemError,
  blueprintProblemVariables,
  mapBlueprintProblem,
  type BlueprintProblemError,
  type BlueprintProblemMode
} from './problemCatalog'

export interface BlueprintProblemCatalogController {
  status: 'idle' | 'loading' | 'ready' | BlueprintProblemError
  problems: readonly BlueprintCreateProblem[]
  hasMore: boolean
  isLoadingMore: boolean
  loadMore: () => void
  retry: () => void
}

function useProblemPages(mode: BlueprintProblemMode, enabled: boolean) {
  const query = useQuery(GET_PROBLEMS, {
    variables: blueprintProblemVariables(mode, null),
    skip: !enabled,
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    context: { queryDeduplication: false }
  })
  const [lastSize, setLastSize] = useState<number>()
  const [pageError, setPageError] = useState<unknown>()
  const [working, setWorking] = useState(false)
  const pending = useRef(false)
  const rows = (query.data ?? query.previousData)?.getProblems ?? []
  let problems: BlueprintCreateProblem[] = []
  let invalid: unknown
  try {
    problems = rows.map(mapBlueprintProblem)
  } catch (error) {
    invalid = error
  }
  const error = query.error ?? invalid ?? pageError
  const loading =
    working ||
    (query.loading && query.networkStatus !== NetworkStatus.fetchMore)
  const more =
    rows.length > 0 && (lastSize ?? rows.length) === BLUEPRINT_PROBLEM_PAGE_SIZE

  async function load(reset = false) {
    if (!enabled || pending.current || loading) {
      return
    }
    pending.current = true
    setWorking(true)
    try {
      const result =
        reset || query.error || invalid
          ? await query.refetch()
          : await query.fetchMore({
              variables: { cursor: Number(rows.at(-1)?.id) },
              updateQuery: (previous, { fetchMoreResult }) => {
                const next = fetchMoreResult.getProblems
                const known = new Set(
                  previous.getProblems.map((problem) => Number(problem.id))
                )
                if (next.length && known.has(Number(next.at(-1)?.id))) {
                  throw new Error('Problem pagination did not advance')
                }
                next.forEach(mapBlueprintProblem)
                return {
                  ...previous,
                  getProblems: uniqueProblems([
                    ...previous.getProblems,
                    ...next
                  ])
                }
              }
            })
      setLastSize(result.data.getProblems.length)
      setPageError(undefined)
    } catch (error) {
      setPageError(error)
    } finally {
      pending.current = false
      setWorking(false)
    }
  }
  return { problems, error, loading, more, working, load }
}

export function useBlueprintProblemCatalog({
  enabled
}: {
  enabled: boolean
}): BlueprintProblemCatalogController {
  const my = useProblemPages('my', enabled)
  const shared = useProblemPages('shared', enabled)
  const streams = [my, shared]
  const loading = streams.some((stream) => stream.loading)
  const errors = streams
    .filter((stream) => stream.error)
    .map((stream) => blueprintProblemError(stream.error))
  const permission =
    errors.find((error) => error === 'unauthenticated') ??
    errors.find((error) => error === 'forbidden')
  let status: BlueprintProblemCatalogController['status'] = 'idle'
  if (enabled) {
    if (loading) {
      status = 'loading'
    } else {
      status = permission ?? (errors.length ? 'error' : 'ready')
    }
  }
  const problems =
    enabled && !permission
      ? uniqueProblems([...my.problems, ...shared.problems])
      : []
  function request(retry: boolean) {
    if (!enabled || loading) {
      return
    }
    streams
      .filter((stream) => (retry ? permission || stream.error : stream.more))
      .forEach((stream) => void stream.load(Boolean(permission)))
  }
  return {
    status,
    problems,
    hasMore: streams.some((stream) => stream.more),
    isLoadingMore:
      streams.some((stream) => stream.working) && problems.length > 0,
    loadMore: () => request(false),
    retry: () => request(true)
  }
}
